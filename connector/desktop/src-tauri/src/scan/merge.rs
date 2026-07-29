use std::collections::HashMap;

use super::{common::ArpEntry, mdns::MdnsObservation, oui, ssdp::SsdpObservation, ScannedDevice};

pub fn merge_scan_observations(
    arp_entries: Vec<ArpEntry>,
    mdns_observations: Vec<MdnsObservation>,
    ssdp_observations: Vec<SsdpObservation>,
) -> Result<Vec<ScannedDevice>, String> {
    let mut by_ip: HashMap<String, ScannedDevice> = HashMap::new();

    for entry in arp_entries {
        let manufacturer = entry
            .mac_address
            .as_deref()
            .and_then(oui::lookup_manufacturer);

        let local_fingerprint = super::fingerprint::stable_fingerprint(
            entry.mac_address.as_deref(),
            entry.hostname.as_deref(),
            manufacturer.as_deref(),
            None,
        )?;

        by_ip.insert(
            entry.ip_address.clone(),
            ScannedDevice {
                local_fingerprint,
                ip_address: Some(entry.ip_address.clone()),
                mac_address: entry.mac_address,
                hostname: entry.hostname,
                manufacturer,
                model: None,
                friendly_name: None,
                device_type: None,
                discovery_source: "ARP".into(),
                discovery_sources: vec!["ARP".into()],
                mdns_services: Vec::new(),
                ssdp_device_type: None,
                ssdp_description_url: None,
                online: true,
            },
        );
    }

    for observation in mdns_observations {
        let ip_address = observation.ip_address.clone().or_else(|| {
            observation
                .hostname
                .as_deref()
                .and_then(resolve_hostname_to_ip)
        });

        let Some(ip_address) = ip_address else {
            continue;
        };

        if let Some(device) = by_ip.get_mut(&ip_address) {
            enrich_from_mdns(device, &observation);
            continue;
        }

        let hostname = observation.hostname.clone();
        let manufacturer = hostname
            .as_deref()
            .and_then(guess_manufacturer_from_hostname);

        let local_fingerprint = super::fingerprint::stable_fingerprint(
            None,
            hostname.as_deref(),
            manufacturer.as_deref(),
            None,
        )?;

        let mut device = ScannedDevice {
            local_fingerprint,
            ip_address: Some(ip_address.clone()),
            mac_address: None,
            hostname,
            manufacturer,
            model: None,
            friendly_name: observation.friendly_name.clone(),
            device_type: None,
            discovery_source: "mDNS".into(),
            discovery_sources: vec!["mDNS".into()],
            mdns_services: observation.services.clone(),
            ssdp_device_type: None,
            ssdp_description_url: None,
            online: true,
        };

        enrich_from_mdns(&mut device, &observation);
        by_ip.insert(ip_address, device);
    }

    for observation in ssdp_observations {
        if !by_ip.contains_key(&observation.ip_address) {
            let local_fingerprint = super::fingerprint::stable_fingerprint(
                None,
                observation.friendly_name.as_deref(),
                None,
                observation.device_type.as_deref(),
            )?;

            by_ip.insert(
                observation.ip_address.clone(),
                ScannedDevice {
                    local_fingerprint,
                    ip_address: Some(observation.ip_address.clone()),
                    mac_address: None,
                    hostname: observation.friendly_name.clone(),
                    manufacturer: None,
                    model: None,
                    friendly_name: observation.friendly_name.clone(),
                    device_type: None,
                    discovery_source: "SSDP".into(),
                    discovery_sources: vec!["SSDP".into()],
                    mdns_services: Vec::new(),
                    ssdp_device_type: observation.device_type.clone(),
                    ssdp_description_url: observation.description_url.clone(),
                    online: true,
                },
            );
            continue;
        }

        if let Some(device) = by_ip.get_mut(&observation.ip_address) {
            enrich_from_ssdp(device, &observation);
        }
    }

    Ok(by_ip.into_values().collect())
}

fn enrich_from_mdns(device: &mut ScannedDevice, observation: &MdnsObservation) {
    if device.hostname.is_none() {
        device.hostname = observation.hostname.clone();
    }

    if device.friendly_name.is_none() {
        device.friendly_name = observation.friendly_name.clone();
    }

    for service in &observation.services {
        if !device.mdns_services.contains(service) {
            device.mdns_services.push(service.clone());
        }
    }

    if !device.discovery_sources.contains(&"mDNS".to_string()) {
        device.discovery_sources.push("mDNS".into());
    }

    device.discovery_source = device.discovery_sources.join(" + ");
}

fn enrich_from_ssdp(device: &mut ScannedDevice, observation: &SsdpObservation) {
    if device.ssdp_device_type.is_none() {
        device.ssdp_device_type = observation.device_type.clone();
    }

    if device.ssdp_description_url.is_none() {
        device.ssdp_description_url = observation.description_url.clone();
    }

    if device.friendly_name.is_none() {
        device.friendly_name = observation.friendly_name.clone();
    }

    if !device.discovery_sources.contains(&"SSDP".to_string()) {
        device.discovery_sources.push("SSDP".into());
    }

    device.discovery_source = device.discovery_sources.join(" + ");
}

fn resolve_hostname_to_ip(_hostname: &str) -> Option<String> {
    None
}

fn guess_manufacturer_from_hostname(hostname: &str) -> Option<String> {
    let lower = hostname.to_lowercase();

    if lower.contains("iphone") || lower.contains("ipad") || lower.contains("appletv") {
        return Some("Apple".into());
    }

    if lower.contains("roku") {
        return Some("Roku".into());
    }

    if lower.contains("echo") || lower.contains("alexa") {
        return Some("Amazon".into());
    }

    if lower.contains("nest") || lower.contains("chromecast") {
        return Some("Google".into());
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn same_ip_different_mac_stays_distinct() {
        let arp_entries = vec![
            ArpEntry {
                ip_address: "192.168.1.20".into(),
                mac_address: Some("aa:bb:cc:dd:ee:01".into()),
                hostname: Some("device-a.local".into()),
            },
            ArpEntry {
                ip_address: "192.168.1.21".into(),
                mac_address: Some("aa:bb:cc:dd:ee:02".into()),
                hostname: Some("device-b.local".into()),
            },
        ];

        let devices = merge_scan_observations(arp_entries, vec![], vec![]).expect("merge");

        assert_eq!(devices.len(), 2);
        assert_ne!(devices[0].local_fingerprint, devices[1].local_fingerprint);
    }
}
