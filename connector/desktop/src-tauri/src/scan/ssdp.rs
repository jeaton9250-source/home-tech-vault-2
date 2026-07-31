use std::collections::HashMap;
use std::io::Read;
use std::net::{Ipv4Addr, SocketAddr, UdpSocket};
use std::time::{Duration, Instant};

use quick_xml::events::Event;
use quick_xml::Reader;
use reqwest::blocking::Client;
use reqwest::redirect::Policy;

use super::common::is_private_ipv4;

const SSDP_MULTICAST_ADDR: SocketAddr = SocketAddr::new(
    std::net::IpAddr::V4(Ipv4Addr::new(239, 255, 255, 250)),
    1900,
);

const DESCRIPTION_TIMEOUT: Duration = Duration::from_millis(2_500);

const DESCRIPTION_MAX_BYTES: usize = 32_768;

#[derive(Debug, Clone)]
pub struct SsdpObservation {
    pub ip_address: String,
    pub device_type: Option<String>,
    pub description_url: Option<String>,
    pub friendly_name: Option<String>,
    pub manufacturer: Option<String>,
    pub model: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
struct UpnpDescription {
    friendly_name: Option<String>,
    manufacturer: Option<String>,
    model_name: Option<String>,
    model_number: Option<String>,
    device_type: Option<String>,
}

pub fn discover_ssdp(timeout: Duration) -> Result<Vec<SsdpObservation>, String> {
    let socket = UdpSocket::bind("0.0.0.0:0")
        .map_err(|error| format!("Unable to bind SSDP socket: {error}"))?;

    socket
        .set_read_timeout(Some(timeout))
        .map_err(|error| format!("Unable to configure SSDP timeout: {error}"))?;

    let msearch = concat!(
        "M-SEARCH * HTTP/1.1\r\n",
        "HOST: 239.255.255.250:1900\r\n",
        "MAN: \"ssdp:discover\"\r\n",
        "MX: 2\r\n",
        "ST: ssdp:all\r\n",
        "\r\n"
    );

    socket
        .send_to(msearch.as_bytes(), SSDP_MULTICAST_ADDR)
        .map_err(|error| format!("Unable to send SSDP M-SEARCH: {error}"))?;

    let started = Instant::now();

    let mut observations = HashMap::<String, SsdpObservation>::new();

    let mut buffer = [0_u8; 4096];

    while started.elapsed() < timeout {
        match socket.recv_from(&mut buffer) {
            Ok((length, source)) => {
                if !source.ip().is_ipv4() {
                    continue;
                }

                let payload = String::from_utf8_lossy(&buffer[..length]);

                if payload.trim().is_empty() {
                    continue;
                }

                let headers = parse_ssdp_headers(&payload);

                let ip_address = source.ip().to_string();

                if !is_private_ipv4(&ip_address) {
                    continue;
                }

                let device_type = headers.get("ST").or_else(|| headers.get("NT")).cloned();

                let description_url = headers
                    .get("LOCATION")
                    .and_then(|value| sanitize_private_description_url(value));

                observations
                    .entry(ip_address.clone())
                    .and_modify(|existing| {
                        if existing.device_type.is_none() {
                            existing.device_type = device_type.clone();
                        }

                        if existing.description_url.is_none() {
                            existing.description_url = description_url.clone();
                        }
                    })
                    .or_insert(SsdpObservation {
                        ip_address,
                        device_type,
                        description_url,
                        friendly_name: None,
                        manufacturer: None,
                        model: None,
                    });
            }

            Err(error)
                if error.kind() == std::io::ErrorKind::WouldBlock
                    || error.kind() == std::io::ErrorKind::TimedOut =>
            {
                break;
            }

            Err(_) => break,
        }
    }

    let client = build_description_client();

    for observation in observations.values_mut() {
        let Some(url) = observation.description_url.clone() else {
            continue;
        };

        let Some(client) = client.as_ref() else {
            break;
        };

        let Ok(description) = fetch_upnp_description(client, &url) else {
            continue;
        };

        if description.friendly_name.is_some() {
            observation.friendly_name = description.friendly_name;
        }

        if description.manufacturer.is_some() {
            observation.manufacturer = description.manufacturer;
        }

        observation.model = description.model_number.or(description.model_name);

        if observation.device_type.is_none() {
            observation.device_type = description.device_type;
        }
    }

    Ok(observations.into_values().collect())
}

fn build_description_client() -> Option<Client> {
    Client::builder()
        .timeout(DESCRIPTION_TIMEOUT)
        .redirect(Policy::none())
        .user_agent("Home-Tech-Vault-Connector/1.0")
        .build()
        .ok()
}

fn fetch_upnp_description(client: &Client, raw_url: &str) -> Result<UpnpDescription, String> {
    let url = sanitize_private_description_url(raw_url)
        .ok_or_else(|| "UPnP description URL is not private.".to_string())?;

    let response = client
        .get(url)
        .header(reqwest::header::ACCEPT, "application/xml, text/xml, */*")
        .send()
        .map_err(|error| format!("Unable to fetch UPnP description: {error}"))?;

    if !response.status().is_success() {
        return Err(format!(
            "UPnP description returned status {}.",
            response.status()
        ));
    }

    let mut bytes = Vec::new();

    response
        .take(DESCRIPTION_MAX_BYTES as u64 + 1)
        .read_to_end(&mut bytes)
        .map_err(|error| format!("Unable to read UPnP description: {error}"))?;

    if bytes.len() > DESCRIPTION_MAX_BYTES {
        return Err("UPnP description exceeded the size limit.".to_string());
    }

    parse_upnp_description(&bytes)
}

fn parse_upnp_description(xml: &[u8]) -> Result<UpnpDescription, String> {
    let mut reader = Reader::from_reader(xml);

    reader.config_mut().trim_text(true);

    let mut result = UpnpDescription::default();

    let mut current_tag: Option<String> = None;

    loop {
        match reader.read_event() {
            Ok(Event::Start(event)) => {
                current_tag = Some(local_tag_name(event.name().as_ref()));
            }

            Ok(Event::Text(text)) => {
                let Some(tag) = current_tag.as_deref() else {
                    continue;
                };

                let value = text
                    .decode()
                    .map_err(|error| format!("Unable to decode UPnP XML: {error}"))?;

                let sanitized = sanitize_metadata(value.as_ref());

                if sanitized.is_empty() {
                    continue;
                }

                match tag {
                    "friendlyName" if result.friendly_name.is_none() => {
                        result.friendly_name = Some(sanitized);
                    }

                    "manufacturer" if result.manufacturer.is_none() => {
                        result.manufacturer = Some(sanitized);
                    }

                    "modelName" if result.model_name.is_none() => {
                        result.model_name = Some(sanitized);
                    }

                    "modelNumber" if result.model_number.is_none() => {
                        result.model_number = Some(sanitized);
                    }

                    "deviceType" if result.device_type.is_none() => {
                        result.device_type = Some(sanitized);
                    }

                    _ => {}
                }
            }

            Ok(Event::End(_)) => {
                current_tag = None;
            }

            Ok(Event::Eof) => {
                break;
            }

            Err(error) => {
                return Err(format!("Unable to parse UPnP XML: {error}"));
            }

            _ => {}
        }
    }

    Ok(result)
}

fn local_tag_name(raw: &[u8]) -> String {
    let name = String::from_utf8_lossy(raw);

    name.rsplit(':').next().unwrap_or(name.as_ref()).to_string()
}

fn parse_ssdp_headers(payload: &str) -> HashMap<String, String> {
    let mut headers = HashMap::new();

    for line in payload.lines() {
        let Some((key, value)) = line.split_once(':') else {
            continue;
        };

        let normalized_key = key.trim().to_ascii_uppercase();

        let normalized_value = sanitize_metadata(value.trim());

        if !normalized_key.is_empty() && !normalized_value.is_empty() {
            headers.insert(normalized_key, normalized_value);
        }
    }

    headers
}

fn sanitize_metadata(value: &str) -> String {
    value
        .chars()
        .filter(|ch| !ch.is_control())
        .collect::<String>()
        .trim()
        .chars()
        .take(512)
        .collect()
}

fn sanitize_private_description_url(value: &str) -> Option<String> {
    let trimmed = value.trim();

    if !(trimmed.starts_with("http://") || trimmed.starts_with("https://")) {
        return None;
    }

    let parsed = reqwest::Url::parse(trimmed).ok()?;

    if parsed.username() != "" || parsed.password().is_some() || parsed.fragment().is_some() {
        return None;
    }

    let host = parsed.host_str()?;

    if !is_private_ipv4(host) {
        return None;
    }

    Some(parsed.to_string().chars().take(512).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_ssdp_headers() {
        let sample =
            "HTTP/1.1 200 OK\r\nST: urn:schemas-upnp-org:device:MediaRenderer:1\r\nLOCATION: http://192.168.1.20/description.xml\r\nSERVER: Linux/3.10 UPnP/1.0\r\n\r\n";

        let headers = parse_ssdp_headers(sample);

        assert_eq!(
            headers.get("ST").map(String::as_str),
            Some("urn:schemas-upnp-org:device:MediaRenderer:1")
        );
    }

    #[test]
    fn rejects_public_description_urls() {
        assert!(sanitize_private_description_url("http://8.8.8.8/description.xml").is_none());
    }

    #[test]
    fn accepts_private_description_urls() {
        assert_eq!(
            sanitize_private_description_url("http://192.168.1.20/description.xml"),
            Some("http://192.168.1.20/description.xml".into())
        );
    }

    #[test]
    fn parses_upnp_device_description() {
        let xml = br#"
          <root xmlns="urn:schemas-upnp-org:device-1-0">
            <device>
              <deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>
              <friendlyName>Living Room Television</friendlyName>
              <manufacturer>Samsung Electronics</manufacturer>
              <modelName>Smart TV</modelName>
              <modelNumber>QN65Q80</modelNumber>
            </device>
          </root>
        "#;

        let result = parse_upnp_description(xml).expect("description should parse");

        assert_eq!(
            result.friendly_name.as_deref(),
            Some("Living Room Television")
        );

        assert_eq!(result.manufacturer.as_deref(), Some("Samsung Electronics"));

        assert_eq!(result.model_number.as_deref(), Some("QN65Q80"));
    }
}
