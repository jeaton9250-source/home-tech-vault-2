use std::process::Command;

use regex::Regex;

#[derive(Debug, Clone)]
pub struct ArpEntry {
    pub ip_address: String,
    pub mac_address: Option<String>,
    pub hostname: Option<String>,
}

pub fn read_arp_table() -> Result<Vec<ArpEntry>, String> {
    let output = Command::new("arp")
        .arg("-a")
        .output()
        .map_err(|error| format!("Unable to read ARP table: {error}"))?;

    if !output.status.success() {
        return Err("ARP lookup failed on this Mac.".into());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    parse_arp_output(&stdout)
}

pub fn parse_arp_output(stdout: &str) -> Result<Vec<ArpEntry>, String> {
    let line_pattern = Regex::new(
        r"(?mi)^(?P<host>[^\s(]+)\s+\((?P<ip>\d{1,3}(?:\.\d{1,3}){3})\)\s+at\s+(?P<mac>[0-9a-f:]+|\(incomplete\))",
    )
    .map_err(|error| error.to_string())?;

    let mut entries = Vec::new();

    for captures in line_pattern.captures_iter(stdout) {
        let ip_address = captures
            .name("ip")
            .map(|value| value.as_str().to_string())
            .ok_or_else(|| "Missing IP in ARP row.".to_string())?;

        let mac_raw = captures
            .name("mac")
            .map(|value| value.as_str())
            .unwrap_or("(incomplete)");

        if mac_raw.eq_ignore_ascii_case("(incomplete)") {
            continue;
        }

        let mac_address = normalize_mac(mac_raw);

        if mac_address.is_none() {
            continue;
        }

        let host_raw = captures
            .name("host")
            .map(|value| value.as_str())
            .unwrap_or("?");

        let hostname = extract_hostname(host_raw, &ip_address);

        entries.push(ArpEntry {
            ip_address,
            mac_address,
            hostname,
        });
    }

    Ok(entries)
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

fn normalize_mac(value: &str) -> Option<String> {
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

fn extract_hostname(host: &str, ip_address: &str) -> Option<String> {
    let trimmed = host.trim();

    if trimmed.is_empty() || trimmed == "?" || trimmed == ip_address {
        return None;
    }

    Some(trimmed.trim_end_matches(".local").to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_macos_arp_rows() {
        let sample = r#"? (192.168.1.1) at aa:bb:cc:dd:ee:01 on en0 ifscope [ethernet]
living-room-tv.local (192.168.1.20) at 11:22:33:44:55:66 on en0 ifscope [ethernet]
? (192.168.1.99) at (incomplete) on en0 ifscope [ethernet]
"#;

        let entries = parse_arp_output(sample).expect("parse");

        assert_eq!(entries.len(), 2);
        assert_eq!(entries[0].ip_address, "192.168.1.1");
        assert_eq!(
            entries[0].mac_address.as_deref(),
            Some("aa:bb:cc:dd:ee:01")
        );
        assert_eq!(
            entries[1].hostname.as_deref(),
            Some("living-room-tv")
        );
    }
}
