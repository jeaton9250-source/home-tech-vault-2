mod http;
mod scan;
mod tray;

use std::fs;
use std::path::PathBuf;

use http::{
    connector_platform, pair_connector_request, send_heartbeat_request, sync_discovery_request,
    ConnectorCommandError, DiscoverySyncSuccess, HeartbeatSuccess, PairConfirmSuccess,
};
use scan::{request_scan_cancel, scan_local_network, ScanSummary};
use keyring::Entry;
use tauri::{AppHandle, Manager};
use tray::{
    attach_window_close_handler, handle_run_event, setup_tray, ConnectorRuntimeState,
};

const KEYCHAIN_SERVICE: &str = "com.hometechvault.connector";
const KEYCHAIN_USER: &str = "connector-token";
const METADATA_FILE: &str = "connector-metadata.json";

fn credential_store_label() -> &'static str {
    if cfg!(target_os = "windows") {
        "Windows Credential Manager"
    } else if cfg!(target_os = "macos") {
        "Keychain"
    } else {
        "secure credential storage"
    }
}

fn metadata_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app.path().app_config_dir().map_err(|error| error.to_string())?;
    fs::create_dir_all(&config_dir).map_err(|error| error.to_string())?;
    Ok(config_dir.join(METADATA_FILE))
}

#[tauri::command]
fn save_connector_token(token: String) -> Result<(), String> {
    if token.trim().is_empty() {
        return Err("Connector token is empty.".into());
    }

    let entry = Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_USER).map_err(|error| error.to_string())?;
    entry.set_password(&token).map_err(|error| error.to_string())?;

    let stored = entry.get_password().map_err(|error| error.to_string())?;
    if stored != token {
        return Err(format!(
            "{} did not persist the connector token.",
            credential_store_label()
        ));
    }

    Ok(())
}

#[tauri::command]
fn load_connector_token() -> Result<Option<String>, String> {
    match Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_USER) {
        Ok(entry) => match entry.get_password() {
            Ok(token) if token.trim().is_empty() => Ok(None),
            Ok(token) => Ok(Some(token)),
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(error) => Err(format!(
                "Unable to read connector token from {}: {error}",
                credential_store_label()
            )),
        },
        Err(error) => Err(error.to_string()),
    }
}

#[tauri::command]
fn delete_connector_token() -> Result<(), String> {
    match Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_USER) {
        Ok(entry) => match entry.delete_credential() {
            Ok(()) => Ok(()),
            Err(keyring::Error::NoEntry) => Ok(()),
            Err(error) => Err(error.to_string()),
        },
        Err(error) => Err(error.to_string()),
    }
}

#[tauri::command]
fn save_connector_metadata(app: AppHandle, metadata_json: String) -> Result<(), String> {
    fs::write(metadata_path(&app)?, metadata_json).map_err(|error| error.to_string())
}

#[tauri::command]
fn load_connector_metadata(app: AppHandle) -> Result<Option<String>, String> {
    let path = metadata_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    Ok(Some(fs::read_to_string(path).map_err(|error| error.to_string())?))
}

#[tauri::command]
fn delete_connector_metadata(app: AppHandle) -> Result<(), String> {
    let path = metadata_path(&app)?;
    if path.exists() {
        fs::remove_file(path).map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_device_name() -> Result<String, String> {
    hostname::get()
        .map(|name| name.to_string_lossy().into_owned())
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn get_connector_platform() -> String {
    connector_platform().to_string()
}

#[tauri::command]
async fn pair_connector(
    api_base_url: String,
    code: String,
    connector_name: String,
    app_version: String,
) -> Result<PairConfirmSuccess, ConnectorCommandError> {
    pair_connector_request(api_base_url, code, connector_name, app_version).await
}

#[tauri::command]
async fn send_connector_heartbeat(
    api_base_url: String,
    connector_token: String,
    app_version: String,
    device_name: String,
) -> Result<HeartbeatSuccess, ConnectorCommandError> {
    send_heartbeat_request(api_base_url, connector_token, app_version, device_name).await
}

#[tauri::command]
fn scan_my_network() -> Result<ScanSummary, String> {
    scan_local_network()
}

#[tauri::command]
fn cancel_network_scan() {
    request_scan_cancel();
}

#[tauri::command]
async fn sync_discovery_results(
    api_base_url: String,
    connector_token: String,
    scanned_at: String,
    devices: serde_json::Value,
    run_matching: bool,
) -> Result<DiscoverySyncSuccess, ConnectorCommandError> {
    sync_discovery_request(
        api_base_url,
        connector_token,
        scanned_at,
        devices,
        run_matching,
    )
    .await
}

#[cfg(test)]
mod credential_tests {
    use super::*;

    #[test]
    fn roundtrips_connector_token_in_secure_store() {
        let entry = Entry::new(KEYCHAIN_SERVICE, "connector-token-test").expect("credential entry");
        let _ = entry.delete_credential();
        entry.set_password("roundtrip-test-value").expect("write");
        assert_eq!(
            entry.get_password().expect("read"),
            "roundtrip-test-value"
        );
        entry.delete_credential().expect("cleanup");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ConnectorRuntimeState::new())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .invoke_handler(tauri::generate_handler![
            save_connector_token,
            load_connector_token,
            delete_connector_token,
            save_connector_metadata,
            load_connector_metadata,
            delete_connector_metadata,
            get_device_name,
            get_connector_platform,
            pair_connector,
            send_connector_heartbeat,
            scan_my_network,
            cancel_network_scan,
            sync_discovery_results,
            tray::set_connector_runtime_preferences,
            tray::quit_connector_app,
            tray::hide_connector_window,
            tray::show_connector_window,
        ])
        .setup(|app| {
            setup_tray(app.handle())?;
            attach_window_close_handler(app.handle());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            handle_run_event(app_handle, &event);
        });
}
