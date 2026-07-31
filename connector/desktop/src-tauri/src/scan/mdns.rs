use std::collections::HashSet;
use std::net::{Ipv4Addr, SocketAddr, UdpSocket};
use std::time::{Duration, Instant};

use hickory_proto::op::Message;
use hickory_proto::rr::RData;

use super::common::is_private_ipv4;

const MDNS_MULTICAST: Ipv4Addr = Ipv4Addr::new(224, 0, 0, 251);

#[derive(Debug, Clone)]
pub struct MdnsObservation {
    pub ip_address: Option<String>,

    pub hostname: Option<String>,

    pub services: Vec<String>,

    pub friendly_name: Option<String>,

    pub manufacturer: Option<String>,

    pub model: Option<String>,
}

#[derive(Debug, Clone, Default)]
struct ParsedMdnsHints {
    ip_addresses: Vec<String>,

    hostname: Option<String>,

    services: Vec<String>,

    friendly_name: Option<String>,

    manufacturer: Option<String>,

    model: Option<String>,
}

pub fn discover_mdns(timeout: Duration) -> Result<Vec<MdnsObservation>, String> {
    let socket = UdpSocket::bind("0.0.0.0:0")
        .map_err(|error| format!("Unable to bind mDNS socket: {error}"))?;

    socket
        .set_read_timeout(Some(Duration::from_millis(250)))
        .map_err(|error| format!("Unable to configure mDNS timeout: {error}"))?;

    socket
        .join_multicast_v4(&MDNS_MULTICAST, &Ipv4Addr::UNSPECIFIED)
        .map_err(|error| format!("Unable to join mDNS multicast group: {error}"))?;

    let browse_targets = [
        "_services._dns-sd._udp.local",
        "_airplay._tcp.local",
        "_googlecast._tcp.local",
        "_ipp._tcp.local",
        "_ipps._tcp.local",
        "_printer._tcp.local",
        "_hap._tcp.local",
        "_homekit._tcp.local",
        "_sonos._tcp.local",
        "_spotify-connect._tcp.local",
        "_hue._tcp.local",
        "_home-assistant._tcp.local",
        "_raop._tcp.local",
        "_smb._tcp.local",
        "_device-info._tcp.local",
        "_workstation._tcp.local",
        "_companion-link._tcp.local",
        "_roku-ecp._tcp.local",
    ];

    for target in browse_targets {
        let query = build_mdns_query(target);

        let _ = socket.send_to(&query, SocketAddr::from((MDNS_MULTICAST, 5353)));
    }

    let started = Instant::now();

    let mut buffer = [0_u8; 9_000];

    let mut observations: Vec<MdnsObservation> = Vec::new();

    while started.elapsed() < timeout {
        match socket.recv_from(&mut buffer) {
            Ok((length, source)) => {
                let source_ip = match source.ip() {
                    std::net::IpAddr::V4(value) => value.to_string(),

                    _ => continue,
                };

                if !is_private_ipv4(&source_ip) {
                    continue;
                }

                let Ok(message) = Message::from_vec(&buffer[..length]) else {
                    continue;
                };

                let hints = parse_mdns_message(&message);

                if hints.services.is_empty()
                    && hints.hostname.is_none()
                    && hints.friendly_name.is_none()
                    && hints.model.is_none()
                {
                    continue;
                }

                let ip_address = hints
                    .ip_addresses
                    .iter()
                    .find(|ip| is_private_ipv4(ip))
                    .cloned()
                    .unwrap_or(source_ip);

                let observation = MdnsObservation {
                    ip_address: Some(ip_address.clone()),

                    hostname: hints.hostname,

                    services: hints.services,

                    friendly_name: hints.friendly_name,

                    manufacturer: hints.manufacturer,

                    model: hints.model,
                };

                merge_into_collection(&mut observations, observation);
            }

            Err(error)
                if error.kind() == std::io::ErrorKind::WouldBlock
                    || error.kind() == std::io::ErrorKind::TimedOut =>
            {
                continue;
            }

            Err(_) => break,
        }
    }

    Ok(observations)
}

fn parse_mdns_message(message: &Message) -> ParsedMdnsHints {
    let mut hints = ParsedMdnsHints::default();

    let mut services = HashSet::<String>::new();

    let records = message
        .answers
        .iter()
        .chain(message.authorities.iter())
        .chain(message.additionals.iter());

    for record in records {
        let owner_name = normalize_dns_name(&record.name.to_utf8());

        match &record.data {
            RData::A(address) => {
                let ip = address.0.to_string();

                if is_private_ipv4(&ip) && !hints.ip_addresses.contains(&ip) {
                    hints.ip_addresses.push(ip);
                }

                if hints.hostname.is_none() && is_local_hostname(&owner_name) {
                    hints.hostname = Some(owner_name.clone());
                }
            }

            RData::PTR(ptr) => {
                let target = normalize_dns_name(&ptr.0.to_utf8());

                collect_services(&owner_name, &mut services);

                collect_services(&target, &mut services);

                if hints.friendly_name.is_none() {
                    hints.friendly_name = extract_instance_name(&target);
                }
            }

            RData::SRV(srv) => {
                let target = normalize_dns_name(&srv.target.to_utf8());

                if is_local_hostname(&target) {
                    hints.hostname = Some(target);
                }

                collect_services(&owner_name, &mut services);

                if hints.friendly_name.is_none() {
                    hints.friendly_name = extract_instance_name(&owner_name);
                }
            }

            RData::TXT(txt) => {
                collect_services(&owner_name, &mut services);

                if hints.friendly_name.is_none() {
                    hints.friendly_name = extract_instance_name(&owner_name);
                }

                for raw_value in txt.txt_data.iter() {
                    let value = String::from_utf8_lossy(raw_value);

                    parse_txt_value(value.as_ref(), &mut hints);
                }
            }

            _ => {}
        }
    }

    hints.services = services.into_iter().collect();

    hints.services.sort();

    infer_from_services(&mut hints);

    hints
}

fn parse_txt_value(raw: &str, hints: &mut ParsedMdnsHints) {
    let sanitized = sanitize_metadata(raw);

    if sanitized.is_empty() {
        return;
    }

    let Some((raw_key, raw_value)) = sanitized.split_once('=') else {
        return;
    };

    let key = raw_key.trim().to_ascii_lowercase();

    let value = sanitize_metadata(raw_value);

    if value.is_empty() {
        return;
    }

    match key.as_str() {
        "fn" | "name" | "friendlyname" | "friendly_name" | "room" | "roomname" | "nickname"
            if hints.friendly_name.is_none() =>
        {
            hints.friendly_name = Some(value);
        }

        "md" | "model" | "modelname" | "model_name" | "modelnumber" | "model_number" | "am"
        | "product" | "productname" | "product_name"
            if hints.model.is_none() =>
        {
            hints.model = Some(value);
        }

        "manufacturer" | "mf" | "vendor" | "brand" if hints.manufacturer.is_none() => {
            hints.manufacturer = Some(value);
        }

        _ => {}
    }
}

fn infer_from_services(hints: &mut ParsedMdnsHints) {
    let combined = hints.services.join(" ").to_ascii_lowercase();

    if hints.manufacturer.is_none() {
        if combined.contains("_airplay.")
            || combined.contains("_raop.")
            || combined.contains("_homekit.")
        {
            hints.manufacturer = Some("Apple".into());
        } else if combined.contains("_googlecast.") {
            hints.manufacturer = Some("Google".into());
        } else if combined.contains("_roku-ecp.") {
            hints.manufacturer = Some("Roku".into());
        } else if combined.contains("_sonos.") {
            hints.manufacturer = Some("Sonos".into());
        } else if combined.contains("_hue.") {
            hints.manufacturer = Some("Philips Hue".into());
        }
    }

    if hints.model.is_none() {
        if combined.contains("_printer.")
            || combined.contains("_ipp.")
            || combined.contains("_ipps.")
        {
            hints.model = Some("Network Printer".into());
        } else if combined.contains("_googlecast.") {
            hints.model = Some("Google Cast Device".into());
        } else if combined.contains("_airplay.") {
            hints.model = Some("AirPlay Device".into());
        } else if combined.contains("_hap.") || combined.contains("_homekit.") {
            hints.model = Some("HomeKit Accessory".into());
        }
    }
}

fn collect_services(name: &str, services: &mut HashSet<String>) {
    let labels: Vec<&str> = name.split('.').collect();

    for index in 0..labels.len() {
        let label = labels[index];

        if !label.starts_with('_') {
            continue;
        }

        let Some(protocol) = labels.get(index + 1) else {
            continue;
        };

        if *protocol != "_tcp" && *protocol != "_udp" {
            continue;
        }

        services.insert(format!("{}.{}.local", label, protocol));
    }
}

fn extract_instance_name(name: &str) -> Option<String> {
    let service_index = name.find("._")?;

    let raw = name.get(0..service_index)?.trim();

    if raw.is_empty() || raw.starts_with('_') {
        return None;
    }

    let cleaned = raw.replace("\\032", " ");

    let sanitized = sanitize_metadata(&cleaned);

    if sanitized.is_empty() {
        None
    } else {
        Some(sanitized)
    }
}

fn is_local_hostname(value: &str) -> bool {
    value.ends_with(".local")
        && !value.starts_with('_')
        && !value.contains("._tcp.")
        && !value.contains("._udp.")
}

fn normalize_dns_name(value: &str) -> String {
    value.trim().trim_end_matches('.').to_string()
}

fn merge_into_collection(observations: &mut Vec<MdnsObservation>, incoming: MdnsObservation) {
    let existing = observations.iter_mut().find(|candidate| {
        candidate.ip_address == incoming.ip_address
            || (candidate.hostname.is_some() && candidate.hostname == incoming.hostname)
    });

    if let Some(existing) = existing {
        merge_mdns_observation(existing, &incoming);

        return;
    }

    observations.push(incoming);
}

fn merge_mdns_observation(existing: &mut MdnsObservation, incoming: &MdnsObservation) {
    if existing.ip_address.is_none() {
        existing.ip_address = incoming.ip_address.clone();
    }

    if existing.hostname.is_none() {
        existing.hostname = incoming.hostname.clone();
    }

    if existing.friendly_name.is_none() {
        existing.friendly_name = incoming.friendly_name.clone();
    }

    if existing.manufacturer.is_none() {
        existing.manufacturer = incoming.manufacturer.clone();
    }

    if existing.model.is_none() {
        existing.model = incoming.model.clone();
    }

    for service in &incoming.services {
        if !existing.services.contains(service) {
            existing.services.push(service.clone());
        }
    }

    existing.services.sort();

    existing.services.dedup();
}

fn sanitize_metadata(value: &str) -> String {
    value
        .chars()
        .filter(|character| !character.is_control())
        .collect::<String>()
        .trim()
        .chars()
        .take(512)
        .collect()
}

fn build_mdns_query(name: &str) -> Vec<u8> {
    let mut packet = Vec::new();

    packet.extend_from_slice(&[
        0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);

    for label in name.split('.') {
        packet.push(label.len() as u8);

        packet.extend_from_slice(label.as_bytes());
    }

    packet.push(0x00);

    packet.extend_from_slice(&[0x00, 0x0c, 0x00, 0x01]);

    packet
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_service_from_instance_name() {
        let mut services = HashSet::new();

        collect_services("Living Room._googlecast._tcp.local", &mut services);

        assert!(services.contains("_googlecast._tcp.local"));
    }

    #[test]
    fn extracts_friendly_instance_name() {
        assert_eq!(
            extract_instance_name("Living Room TV._airplay._tcp.local").as_deref(),
            Some("Living Room TV")
        );
    }

    #[test]
    fn extracts_txt_model_and_name() {
        let mut hints = ParsedMdnsHints::default();

        parse_txt_value("fn=Kitchen Speaker", &mut hints);

        parse_txt_value("md=HomePod16,1", &mut hints);

        assert_eq!(hints.friendly_name.as_deref(), Some("Kitchen Speaker"));

        assert_eq!(hints.model.as_deref(), Some("HomePod16,1"));
    }

    #[test]
    fn infers_google_from_cast_service() {
        let mut hints = ParsedMdnsHints {
            services: vec!["_googlecast._tcp.local".into()],

            ..Default::default()
        };

        infer_from_services(&mut hints);

        assert_eq!(hints.manufacturer.as_deref(), Some("Google"));
    }
}
