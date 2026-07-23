pub fn stable_fingerprint(
    mac_address: Option<&str>,
    hostname: Option<&str>,
    manufacturer: Option<&str>,
    model: Option<&str>,
) -> Result<String, String> {
    if let Some(mac) = mac_address {
        let normalized = normalize_mac(mac);

        if !normalized.is_empty() {
            return Ok(format!("mac:{normalized}"));
        }
    }

    let hostname = normalize_hostname(hostname);
    let manufacturer = normalize_token(manufacturer);
    let model = normalize_token(model);

    let mut parts = Vec::new();

    if !hostname.is_empty() && !is_generic_hostname(&hostname) {
        parts.push(format!("host:{hostname}"));
    }

    if !manufacturer.is_empty() {
        parts.push(format!("mfg:{manufacturer}"));
    }

    if !model.is_empty() {
        parts.push(format!("model:{model}"));
    }

    if parts.is_empty() {
        return Err(
            "Unable to compute a stable fingerprint without MAC or identifying metadata."
                .into(),
        );
    }

    Ok(parts.join("|"))
}

fn normalize_mac(value: &str) -> String {
    let hex: String = value
        .chars()
        .filter(|ch| ch.is_ascii_hexdigit())
        .collect::<String>()
        .to_lowercase();

    if hex.len() != 12 {
        return String::new();
    }

    hex.as_bytes()
        .chunks(2)
        .map(|chunk| std::str::from_utf8(chunk).unwrap_or("00"))
        .collect::<Vec<_>>()
        .join(":")
}

fn normalize_hostname(value: Option<&str>) -> String {
    let Some(raw) = value else {
        return String::new();
    };

    raw.trim()
        .to_lowercase()
        .trim_end_matches(".local")
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() {
                ch
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string()
}

fn normalize_token(value: Option<&str>) -> String {
    let Some(raw) = value else {
        return String::new();
    };

    raw.trim().to_lowercase()
}

fn is_generic_hostname(value: &str) -> bool {
    value.is_empty()
        || value == "unknown"
        || value == "localhost"
        || value.starts_with("network-device")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prefers_mac_fingerprint() {
        let fingerprint = stable_fingerprint(
            Some("AA-BB-CC-DD-EE-FF"),
            Some("device"),
            Some("Apple"),
            None,
        )
        .expect("fingerprint");

        assert_eq!(fingerprint, "mac:aa:bb:cc:dd:ee:ff");
    }
}
