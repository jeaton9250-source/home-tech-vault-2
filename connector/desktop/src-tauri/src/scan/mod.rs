mod arp;
mod fingerprint;
mod oui;

use if_addrs::IfAddr;
use std::sync::atomic::{AtomicBool, Ordering};

use serde::Serialize;

pub static SCAN_CANCEL_REQUESTED: AtomicBool =
    AtomicBool::new(false);

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LocalInterfaceSummary {
    pub name: String,
    pub ip_address: String,
    pub netmask: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScannedDevice {
    pub local_fingerprint: String,
    pub ip_address: Option<String>,
    pub mac_address: Option<String>,
    pub hostname: Option<String>,
    pub manufacturer: Option<String>,
    pub device_type: Option<String>,
    pub discovery_source: String,
    pub online: bool,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScanSummary {
    pub started_at: String,
    pub completed_at: String,
    pub interfaces: Vec<LocalInterfaceSummary>,
    pub devices: Vec<ScannedDevice>,
    pub cancelled: bool,
}

pub fn request_scan_cancel() {
    SCAN_CANCEL_REQUESTED.store(true, Ordering::SeqCst);
}

pub fn reset_scan_cancel() {
    SCAN_CANCEL_REQUESTED.store(false, Ordering::SeqCst);
}

fn is_scan_cancelled() -> bool {
    SCAN_CANCEL_REQUESTED.load(Ordering::SeqCst)
}

pub fn scan_local_network() -> Result<ScanSummary, String> {
    reset_scan_cancel();

    let started_at = chrono_now_iso();
    let interfaces = list_private_interfaces()?;

    if is_scan_cancelled() {
        return Ok(ScanSummary {
            started_at,
            completed_at: chrono_now_iso(),
            interfaces,
            devices: Vec::new(),
            cancelled: true,
        });
    }

    let arp_devices = arp::read_arp_table()?;

    if is_scan_cancelled() {
        return Ok(ScanSummary {
            started_at,
            completed_at: chrono_now_iso(),
            interfaces,
            devices: Vec::new(),
            cancelled: true,
        });
    }

    let mut devices = Vec::new();

    for entry in arp_devices {
        if is_scan_cancelled() {
            break;
        }

        if !arp::is_private_ipv4(&entry.ip_address) {
            continue;
        }

        let manufacturer = entry
            .mac_address
            .as_deref()
            .and_then(oui::lookup_manufacturer);

        let device_type = guess_device_type(
            entry.hostname.as_deref(),
            manufacturer.as_deref(),
        );

        let local_fingerprint =
            fingerprint::stable_fingerprint(
                entry.mac_address.as_deref(),
                entry.hostname.as_deref(),
                manufacturer.as_deref(),
                None,
            )?;

        devices.push(ScannedDevice {
            local_fingerprint,
            ip_address: Some(entry.ip_address),
            mac_address: entry.mac_address,
            hostname: entry.hostname,
            manufacturer,
            device_type,
            discovery_source: "ARP".into(),
            online: true,
        });
    }

    Ok(ScanSummary {
        started_at,
        completed_at: chrono_now_iso(),
        interfaces,
        devices,
        cancelled: is_scan_cancelled(),
    })
}

fn list_private_interfaces() -> Result<Vec<LocalInterfaceSummary>, String> {
    let mut interfaces = Vec::new();

    for iface in if_addrs::get_if_addrs().map_err(|error| error.to_string())? {
        let IfAddr::V4(v4) = iface.addr else {
            continue;
        };

        if v4.ip.is_loopback() {
            continue;
        }

        let ip_address = v4.ip.to_string();

        if !arp::is_private_ipv4(&ip_address) {
            continue;
        }

        interfaces.push(LocalInterfaceSummary {
            name: iface.name,
            ip_address,
            netmask: v4.netmask.to_string(),
        });
    }

    Ok(interfaces)
}

fn guess_device_type(
    hostname: Option<&str>,
    manufacturer: Option<&str>,
) -> Option<String> {
    let haystack = format!(
        "{} {}",
        hostname.unwrap_or(""),
        manufacturer.unwrap_or("")
    )
    .to_lowercase();

    if haystack.contains("iphone")
        || haystack.contains("ipad")
        || haystack.contains("android")
    {
        return Some("Mobile".into());
    }

    if haystack.contains("macbook")
        || haystack.contains("imac")
        || haystack.contains("laptop")
    {
        return Some("Computer".into());
    }

    if haystack.contains("router")
        || haystack.contains("gateway")
        || haystack.contains("eero")
        || haystack.contains("unifi")
    {
        return Some("Networking".into());
    }

    if haystack.contains("roku")
        || haystack.contains("apple-tv")
        || haystack.contains(" tv")
    {
        return Some("TV & Streaming".into());
    }

    if haystack.contains("nest")
        || haystack.contains("echo")
        || haystack.contains("homepod")
    {
        return Some("Smart Home".into());
    }

    None
}

fn chrono_now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn live_local_network_scan_reports_private_devices_only() {
        let started = std::time::Instant::now();
        let summary = scan_local_network().expect("scan should succeed on macOS");

        for device in &summary.devices {
            if let Some(ip) = &device.ip_address {
                assert!(
                    arp::is_private_ipv4(ip),
                    "public IP leaked into scan results: {ip}"
                );
            }
        }

        eprintln!(
            "Live scan completed in {:?}: {} interface(s), {} device(s)",
            started.elapsed(),
            summary.interfaces.len(),
            summary.devices.len()
        );
    }
}
