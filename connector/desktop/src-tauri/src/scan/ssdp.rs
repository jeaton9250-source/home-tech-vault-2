use std::collections::HashMap;
use std::net::{Ipv4Addr, SocketAddr, UdpSocket};
use std::time::{Duration, Instant};

use super::common::is_private_ipv4;

const SSDP_MULTICAST_ADDR: SocketAddr = SocketAddr::new(
    std::net::IpAddr::V4(Ipv4Addr::new(239, 255, 255, 250)),
    1900,
);

#[derive(Debug, Clone)]
pub struct SsdpObservation {
    pub ip_address: String,
    pub device_type: Option<String>,
    pub description_url: Option<String>,
    pub friendly_name: Option<String>,
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
        .send_to(
            msearch.as_bytes(),
            SSDP_MULTICAST_ADDR,
        )
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

                let device_type = headers
                    .get("ST")
                    .or_else(|| headers.get("NT"))
                    .cloned();
                let description_url = headers
                    .get("LOCATION")
                    .and_then(|value| sanitize_private_description_url(value));
                let friendly_name = headers.get("SERVER").cloned();

                observations
                    .entry(ip_address.clone())
                    .and_modify(|existing| {
                        if existing.device_type.is_none() {
                            existing.device_type = device_type.clone();
                        }
                        if existing.description_url.is_none() {
                            existing.description_url =
                                description_url.clone();
                        }
                        if existing.friendly_name.is_none() {
                            existing.friendly_name =
                                friendly_name.clone();
                        }
                    })
                    .or_insert(SsdpObservation {
                        ip_address,
                        device_type,
                        description_url,
                        friendly_name,
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

    Ok(observations.into_values().collect())
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

    let host = trimmed
        .split("//")
        .nth(1)?
        .split('/')
        .next()?
        .split(':')
        .next()?
        .trim();

    if host.is_empty() || !is_private_ipv4(host) {
        return None;
    }

    Some(trimmed.chars().take(512).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_ssdp_headers() {
        let sample = "HTTP/1.1 200 OK\r\nST: urn:schemas-upnp-org:device:MediaRenderer:1\r\nLOCATION: http://192.168.1.20/description.xml\r\nSERVER: Linux/3.10 UPnP/1.0\r\n\r\n";
        let headers = parse_ssdp_headers(sample);

        assert_eq!(
            headers.get("ST").map(String::as_str),
            Some("urn:schemas-upnp-org:device:MediaRenderer:1")
        );
    }

    #[test]
    fn rejects_public_description_urls() {
        assert!(sanitize_private_description_url(
            "http://8.8.8.8/description.xml"
        )
        .is_none());
    }

    #[test]
    fn accepts_private_description_urls() {
        assert_eq!(
            sanitize_private_description_url(
                "http://192.168.1.20/description.xml"
            ),
            Some("http://192.168.1.20/description.xml".into())
        );
    }
}
