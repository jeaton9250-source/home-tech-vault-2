mod common;
mod fingerprint;
mod mdns;
mod merge;
mod oui;
mod ssdp;

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use if_addrs::IfAddr;
use merge::merge_scan_observations;

use common::{is_private_ipv4, ArpEntry};
use serde::Serialize;

pub static SCAN_CANCEL_REQUESTED: AtomicBool = AtomicBool::new(false);

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
    pub model: Option<String>,
    pub friendly_name: Option<String>,
    pub device_type: Option<String>,
    pub discovery_source: String,
    pub discovery_sources: Vec<String>,
    pub mdns_services: Vec<String>,
    pub ssdp_device_type: Option<String>,
    pub ssdp_description_url: Option<String>,
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

fn read_arp_table() -> Result<Vec<ArpEntry>, String> {
    #[cfg(target_os = "macos")]
    {
        return macos::read_arp_table();
    }

    #[cfg(target_os = "windows")]
    {
        return windows::read_arp_table();
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Err("Network scanning is not supported on this platform yet.".into())
    }
}

pub fn scan_local_network() -> Result<ScanSummary, String> {
    reset_scan_cancel();

    let started_at = chrono_now_iso();
    let interfaces = list_private_interfaces()?;
    let arp_devices = read_arp_table()?;

    let mdns_observations = if is_scan_cancelled() {
        Vec::new()
    } else {
        mdns::discover_mdns(Duration::from_secs(3)).unwrap_or_default()
    };

    let ssdp_observations = if is_scan_cancelled() {
        Vec::new()
    } else {
        ssdp::discover_ssdp(Duration::from_secs(2)).unwrap_or_default()
    };

    let devices = merge_scan_observations(arp_devices, mdns_observations, ssdp_observations)?;

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

        if !is_private_ipv4(&ip_address) {
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

fn chrono_now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[cfg(any(target_os = "macos", target_os = "windows"))]
    fn live_local_network_scan_reports_private_devices_only() {
        let summary = scan_local_network().expect("scan should succeed");

        for device in &summary.devices {
            if let Some(ip) = &device.ip_address {
                assert!(is_private_ipv4(ip));
            }
        }
    }
}
