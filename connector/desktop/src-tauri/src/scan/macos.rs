use std::process::Command;

use super::common::{
    dedupe_arp_entries, extract_hostname, is_private_ipv4, macos_line_pattern, normalize_mac,
    ArpEntry,
};

pub fn read_arp_table() -> Result<Vec<ArpEntry>, String> {
    let output = Command::new("arp")
        .arg("-a")
        .output()
        .map_err(|error| format!("Unable to read ARP table: {error}"))?;

    if !output.status.success() {
        return Err("ARP lookup failed on this Mac.".into());
    }

    parse_arp_output(&String::from_utf8_lossy(&output.stdout))
}

pub fn parse_arp_output(stdout: &str) -> Result<Vec<ArpEntry>, String> {
    let line_pattern = macos_line_pattern()?;
    let mut entries = Vec::new();

    for captures in line_pattern.captures_iter(stdout) {
        let ip_address = captures
            .name("ip")
            .map(|value| value.as_str().to_string())
            .ok_or_else(|| "Missing IP in ARP row.".to_string())?;

        if !is_private_ipv4(&ip_address) {
            continue;
        }

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

        entries.push(ArpEntry {
            ip_address: ip_address.clone(),
            mac_address,
            hostname: extract_hostname(host_raw, &ip_address),
        });
    }

    Ok(dedupe_arp_entries(entries))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_macos_arp_rows() {
        let sample = r#"? (192.168.1.1) at aa:bb:cc:dd:ee:01 on en0 ifscope [ethernet]
living-room-tv.local (192.168.1.20) at 11:22:33:44:55:66 on en0 ifscope [ethernet]
"#;

        let entries = parse_arp_output(sample).expect("parse");
        assert_eq!(entries.len(), 2);
    }
}
