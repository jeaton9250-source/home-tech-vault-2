use std::collections::HashMap;

static COMMON_OUI: &[(&str, &str)] = &[
    ("001451", "Google"),
    ("0017f2", "Apple"),
    ("001124", "Apple"),
    ("001cb3", "Apple"),
    ("002312", "Apple"),
    ("28f076", "Apple"),
    ("3c0754", "Apple"),
    ("7c04d0", "Apple"),
    ("a4b197", "Apple"),
    ("001b44", "Samsung"),
    ("002454", "Samsung"),
    ("5c497d", "Samsung"),
    ("001d0f", "Sonos"),
    ("b8e937", "Sonos"),
    ("001d7e", "Roku"),
    ("001ea7", "Amazon"),
    ("0024b2", "Amazon"),
    ("50dc7e", "Amazon"),
    ("001e06", "Netgear"),
    ("002722", "Ubiquiti"),
    ("24a43c", "Ubiquiti"),
    ("001132", "Synology"),
    ("001132", "Synology"),
    ("00155d", "Microsoft"),
    ("001dd8", "Microsoft"),
    ("00155d", "Microsoft"),
    ("001a11", "Google"),
    ("001a11", "Google"),
    ("001e06", "Cisco"),
    ("001cdf", "Belkin"),
    ("001601", "Belkin"),
    ("001d0f", "Sonos"),
    ("001e06", "Linksys"),
];

pub fn lookup_manufacturer(mac_address: &str) -> Option<String> {
    let normalized: String = mac_address
        .chars()
        .filter(|ch| ch.is_ascii_hexdigit())
        .collect::<String>()
        .to_lowercase();

    if normalized.len() < 6 {
        return None;
    }

    // Locally administered / private MAC — OUI is not authoritative.
    if let Ok(first_octet) = u8::from_str_radix(&normalized[..2], 16) {
        if (first_octet & 0b10) != 0 {
            return None;
        }

        // Multicast bit
        if (first_octet & 0b1) != 0 {
            return None;
        }
    }

    if normalized == "ffffffffffff" {
        return None;
    }

    let prefix = &normalized[..6];
    let map = oui_map();

    map.get(prefix).cloned()
}

fn oui_map() -> HashMap<&'static str, String> {
    COMMON_OUI
        .iter()
        .map(|(prefix, name)| (*prefix, name.to_string()))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn looks_up_apple_oui() {
        assert_eq!(
            lookup_manufacturer("28:f0:76:12:34:56").as_deref(),
            Some("Apple")
        );
    }

    #[test]
    fn ignores_private_mac_oui() {
        assert_eq!(
            lookup_manufacturer("86:eb:52:28:4c:ee"),
            None
        );
    }
}
