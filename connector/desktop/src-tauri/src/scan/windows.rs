use std::process::Command;

use super::common::{
    dedupe_arp_entries, is_private_ipv4, normalize_mac, windows_line_pattern, ArpEntry,
};

pub fn read_arp_table() -> Result<Vec<ArpEntry>, String> {
    match read_arp_via_command() {
        Ok(entries) if !entries.is_empty() => Ok(entries),
        Ok(_) | Err(_) => read_arp_via_ip_neighbor_fallback(),
    }
}

fn read_arp_via_command() -> Result<Vec<ArpEntry>, String> {
    let output = Command::new("arp")
        .arg("-a")
        .output()
        .map_err(|error| format!("Unable to read ARP table: {error}"))?;

    if !output.status.success() {
        return Err("ARP lookup failed on Windows.".into());
    }

    parse_arp_output(&String::from_utf8_lossy(&output.stdout))
}

fn read_arp_via_ip_neighbor_fallback() -> Result<Vec<ArpEntry>, String> {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "Get-NetNeighbor -AddressFamily IPv4 | Where-Object { $_.State -ne 'Unreachable' -and $_.LinkLayerAddress -and $_.IPAddress } | ForEach-Object { \"$($_.IPAddress)`t$($_.LinkLayerAddress)\" }",
        ])
        .output()
        .map_err(|error| format!("Unable to read Windows neighbor table: {error}"))?;

    if !output.status.success() {
        return Err("Neighbor lookup failed on Windows.".into());
    }

    let mut entries = Vec::new();

    for line in String::from_utf8_lossy(&output.stdout).lines() {
        let mut parts = line.split_whitespace();
        let ip_address = parts.next().unwrap_or("").trim().to_string();
        let mac_raw = parts.next().unwrap_or("").trim();

        if ip_address.is_empty() || mac_raw.is_empty() || !is_private_ipv4(&ip_address) {
            continue;
        }

        let mac_address = normalize_mac(mac_raw);

        if mac_address.is_none() {
            continue;
        }

        entries.push(ArpEntry {
            ip_address,
            mac_address,
            hostname: None,
        });
    }

    if entries.is_empty() {
        return Err("No private-network neighbors were found on this Windows PC.".into());
    }

    Ok(dedupe_arp_entries(entries))
}

pub fn parse_arp_output(stdout: &str) -> Result<Vec<ArpEntry>, String> {
    let line_pattern = windows_line_pattern()?;
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
            .unwrap_or("");
        let mac_address = normalize_mac(mac_raw);

        if mac_address.is_none() {
            continue;
        }

        entries.push(ArpEntry {
            ip_address,
            mac_address,
            hostname: None,
        });
    }

    Ok(dedupe_arp_entries(entries))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_windows_arp_rows() {
        let sample = r#"Interface: 192.168.1.5 --- 0x4
  Internet Address      Physical Address      Type
  192.168.1.1           aa-bb-cc-dd-ee-01     dynamic
  192.168.1.20          11-22-33-44-55-66     dynamic
"#;

        let entries = parse_arp_output(sample).expect("parse");
        assert_eq!(entries.len(), 2);
    }
}
