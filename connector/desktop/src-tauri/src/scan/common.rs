use regex::Regex;

#[derive(Debug, Clone)]
pub struct ArpEntry {
    pub ip_address: String,
    pub mac_address: Option<String>,
    pub hostname: Option<String>,
}

pub fn is_private_ipv4(value: &str) -> bool {
    let parts: Vec<u8> = value
        .split('.')
        .filter_map(|part| part.parse().ok())
        .collect();

    if parts.len() != 4 {
        return false;
    }

    match parts[0] {
        10 => true,
        172 if (16..=31).contains(&parts[1]) => true,
        192 if parts[1] == 168 => true,
        169 if parts[1] == 254 => true,
        _ => false,
    }
}

pub fn normalize_mac(value: &str) -> Option<String> {
    let hex: String = value
        .chars()
        .filter(|ch| ch.is_ascii_hexdigit())
        .collect::<String>()
        .to_lowercase();

    if hex.len() != 12 {
        return None;
    }

    Some(
        hex.as_bytes()
            .chunks(2)
            .map(|chunk| std::str::from_utf8(chunk).unwrap_or("00"))
            .collect::<Vec<_>>()
            .join(":"),
    )
}

pub fn extract_hostname(host: &str, ip_address: &str) -> Option<String> {
    let trimmed = host.trim();

    if trimmed.is_empty() || trimmed == "?" || trimmed == ip_address {
        return None;
    }

    Some(trimmed.trim_end_matches(".local").to_string())
}

pub fn dedupe_arp_entries(entries: Vec<ArpEntry>) -> Vec<ArpEntry> {
    let mut deduped: Vec<ArpEntry> = Vec::new();

    'outer: for entry in entries {
        for existing in &deduped {
            if existing.ip_address == entry.ip_address {
                continue 'outer;
            }

            if let (Some(left), Some(right)) = (&existing.mac_address, &entry.mac_address) {
                if left == right {
                    continue 'outer;
                }
            }
        }

        deduped.push(entry);
    }

    deduped
}

pub fn macos_line_pattern() -> Result<Regex, String> {
    Regex::new(
        r"(?mi)^(?P<host>[^\s(]+)\s+\((?P<ip>\d{1,3}(?:\.\d{1,3}){3})\)\s+at\s+(?P<mac>[0-9a-f:-]+|\(incomplete\))",
    )
    .map_err(|error| error.to_string())
}

#[cfg(target_os = "windows")]
pub fn windows_line_pattern() -> Result<Regex, String> {
    Regex::new(
        r"(?mi)^\s*(?P<ip>\d{1,3}(?:\.\d{1,3}){3})\s+(?P<mac>[0-9a-f-]{17}|\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})\s+(?:dynamic|static|permanent)",
    )
    .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_private_ipv4_ranges() {
        assert!(is_private_ipv4("10.0.0.1"));
        assert!(is_private_ipv4("192.168.1.1"));
        assert!(is_private_ipv4("172.16.0.1"));
        assert!(is_private_ipv4("169.254.1.1"));
    }

    #[test]
    fn rejects_public_ipv4() {
        assert!(!is_private_ipv4("8.8.8.8"));
        assert!(!is_private_ipv4("203.0.113.1"));
    }

    #[test]
    fn dedupes_entries_by_ip_or_mac() {
        let entries = vec![
            ArpEntry {
                ip_address: "192.168.1.10".into(),
                mac_address: Some("aa:bb:cc:dd:ee:01".into()),
                hostname: None,
            },
            ArpEntry {
                ip_address: "192.168.1.10".into(),
                mac_address: Some("11:22:33:44:55:66".into()),
                hostname: None,
            },
            ArpEntry {
                ip_address: "192.168.1.20".into(),
                mac_address: Some("aa:bb:cc:dd:ee:01".into()),
                hostname: None,
            },
        ];

        let deduped = dedupe_arp_entries(entries);
        assert_eq!(deduped.len(), 1);
        assert_eq!(deduped[0].ip_address, "192.168.1.10");
    }
}
