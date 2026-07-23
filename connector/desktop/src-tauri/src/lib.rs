mod http;

use std::fs;
use std::path::PathBuf;

use http::{
    pair_connector_request, send_heartbeat_request, ConnectorCommandError, HeartbeatSuccess,
    PairConfirmSuccess,
};
use keyring::Entry;
use tauri::{AppHandle, Manager};

const KEYCHAIN_SERVICE: &str = "com.hometechvault.connector";
const KEYCHAIN_USER: &str = "connector-token";
const METADATA_FILE: &str = "connector-metadata.json";

fn metadata_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|error| error.to_string())?;

    fs::create_dir_all(&config_dir).map_err(|error| error.to_string())?;

    Ok(config_dir.join(METADATA_FILE))
}

#[tauri::command]
fn save_connector_token(token: String) -> Result<(), String> {
    if token.trim().is_empty() {
        return Err("Connector token is empty.".into());
    }

    let entry = Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_USER).map_err(|error| error.to_string())?;

    entry
        .set_password(&token)
        .map_err(|error| error.to_string())?;

    let stored = entry.get_password().map_err(|error| error.to_string())?;

    if stored != token {
        return Err(
            "Keychain did not persist the connector token. Allow Keychain access and pair again."
                .into(),
        );
    }

    eprintln!("[htv-connector] connector token saved to Keychain");
    Ok(())
}

#[tauri::command]
fn load_connector_token() -> Result<Option<String>, String> {
    match Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_USER) {
        Ok(entry) => match entry.get_password() {
            Ok(token) => {
                if token.trim().is_empty() {
                    Ok(None)
                } else {
                    Ok(Some(token))
                }
            }
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(error) => Err(format!(
                "Unable to read connector token from Keychain: {error}"
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
    let path = metadata_path(&app)?;
    fs::write(path, metadata_json).map_err(|error| error.to_string())
}

#[tauri::command]
fn load_connector_metadata(app: AppHandle) -> Result<Option<String>, String> {
    let path = metadata_path(&app)?;

    if !path.exists() {
        return Ok(None);
    }

    let contents = fs::read_to_string(path).map_err(|error| error.to_string())?;

    Ok(Some(contents))
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
    send_heartbeat_request(
        api_base_url,
        connector_token,
        app_version,
        device_name,
    )
    .await
}

#[cfg(test)]
mod keychain_tests {
    use super::*;

    #[test]
    fn roundtrips_connector_token_in_keychain() {
        let entry = Entry::new(KEYCHAIN_SERVICE, "connector-token-test")
            .expect("keychain entry");

        let _ = entry.delete_credential();

        entry
            .set_password("roundtrip-test-value")
            .expect("keychain write");

        let stored = entry
            .get_password()
            .expect("keychain read");

        assert_eq!(stored, "roundtrip-test-value");

        entry
            .delete_credential()
            .expect("keychain cleanup");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            save_connector_token,
            load_connector_token,
            delete_connector_token,
            save_connector_metadata,
            load_connector_metadata,
            delete_connector_metadata,
            get_device_name,
            pair_connector,
            send_connector_heartbeat
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
