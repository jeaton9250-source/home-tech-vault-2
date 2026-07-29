use std::collections::{HashMap, HashSet};
use std::net::{Ipv4Addr, SocketAddr, UdpSocket};
use std::time::{Duration, Instant};

use super::common::is_private_ipv4;

const MDNS_MULTICAST: Ipv4Addr = Ipv4Addr::new(224, 0, 0, 251);

#[derive(Debug, Clone)]
pub struct MdnsObservation {
    pub ip_address: Option<String>,
    pub hostname: Option<String>,
    pub services: Vec<String>,
    pub friendly_name: Option<String>,
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
        "_hap._tcp.local",
        "_sonos._tcp.local",
        "_hue._tcp.local",
        "_home-assistant._tcp.local",
        "_raop._tcp.local",
        "_smb._tcp.local",
    ];

    for target in browse_targets {
        let query = build_mdns_query(target);
        let _ = socket.send_to(&query, SocketAddr::from((MDNS_MULTICAST, 5353)));
    }

    let started = Instant::now();
    let mut buffer = [0_u8; 4096];
    let mut by_host: HashMap<String, MdnsObservation> = HashMap::new();

    while started.elapsed() < timeout {
        match socket.recv_from(&mut buffer) {
            Ok((length, source)) => {
                let ip_address = match source.ip() {
                    std::net::IpAddr::V4(value) => value.to_string(),
                    _ => continue,
                };

                if !is_private_ipv4(&ip_address) {
                    continue;
                }

                let payload = String::from_utf8_lossy(&buffer[..length]);
                let hints = parse_mdns_payload(&payload);

                if hints.services.is_empty()
                    && hints.hostname.is_none()
                    && hints.friendly_name.is_none()
                {
                    continue;
                }

                let key = hints.hostname.clone().unwrap_or_else(|| ip_address.clone());

                by_host
                    .entry(key)
                    .and_modify(|existing| {
                        merge_mdns_observation(existing, &hints, &ip_address);
                    })
                    .or_insert(MdnsObservation {
                        ip_address: Some(ip_address),
                        hostname: hints.hostname,
                        services: hints.services,
                        friendly_name: hints.friendly_name,
                    });
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

    Ok(by_host.into_values().collect())
}

#[derive(Default)]
struct ParsedMdnsHints {
    hostname: Option<String>,
    services: Vec<String>,
    friendly_name: Option<String>,
}

fn merge_mdns_observation(
    existing: &mut MdnsObservation,
    hints: &ParsedMdnsHints,
    ip_address: &str,
) {
    if existing.ip_address.is_none() {
        existing.ip_address = Some(ip_address.to_string());
    }

    if existing.hostname.is_none() {
        existing.hostname = hints.hostname.clone();
    }

    if existing.friendly_name.is_none() {
        existing.friendly_name = hints.friendly_name.clone();
    }

    let mut services = existing.services.clone();
    services.extend(hints.services.clone());
    services.sort();
    services.dedup();
    existing.services = services;
}

fn parse_mdns_payload(payload: &str) -> ParsedMdnsHints {
    let mut hints = ParsedMdnsHints::default();
    let mut services = HashSet::new();

    for token in payload.split(|ch: char| ch.is_whitespace() || ch.is_control()) {
        let trimmed = token.trim();

        if trimmed.is_empty() {
            continue;
        }

        if trimmed.contains("._tcp.local") || trimmed.contains("._udp.local") {
            services.insert(trimmed.trim_end_matches('.').to_string());
        }

        if trimmed.ends_with(".local") && !trimmed.starts_with('_') {
            hints.hostname = Some(trimmed.trim_end_matches('.').to_string());
        }
    }

    hints.services = services.into_iter().collect();

    if let Some(service) = hints.services.first() {
        hints.friendly_name = service
            .split('.')
            .next()
            .map(|value| value.replace('-', " "));
    }

    hints
}

fn build_mdns_query(name: &str) -> Vec<u8> {
    let mut packet = Vec::new();

    packet.extend_from_slice(&[0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
    packet.extend_from_slice(&[0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

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
    fn extracts_service_types_from_mdns_payload() {
        let sample = "living-room._googlecast._tcp.local PTR _googlecast._tcp.local";
        let hints = parse_mdns_payload(sample);

        assert!(hints
            .services
            .iter()
            .any(|service| service.contains("_googlecast._tcp")));
    }
}
