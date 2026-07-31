mod http;
mod scan;
mod tray;

use std::fs;
use std::net::IpAddr;
use std::path::PathBuf;
use std::time::Duration;

use http::{
    claim_home_assistant_command_request,
    complete_home_assistant_command_request,
    connector_platform,
    create_apple_home_pairing_session_request,
    get_apple_home_pairing_status_request,
    pair_connector_request,
    send_heartbeat_request,
    sync_discovery_request,
    sync_home_assistant_entities_request,
    AppleHomePairingInitSuccess,
    AppleHomePairingStatusSuccess,
    ConnectorCommandError,
    DiscoverySyncSuccess,
    HeartbeatSuccess,
    HomeAssistantCommandClaimSuccess,
    HomeAssistantCommandCompletionSuccess,
    HomeAssistantEntitySyncSuccess,
    PairConfirmSuccess,
};

use keyring::Entry;
use reqwest::{redirect::Policy, Client, StatusCode, Url};
use scan::{request_scan_cancel, scan_local_network, ScanSummary};
use serde::Serialize;
use tauri::{AppHandle, Manager};

use tray::{attach_window_close_handler, handle_run_event, setup_tray, ConnectorRuntimeState};

const KEYCHAIN_SERVICE: &str = "com.hometechvault.connector";

const KEYCHAIN_USER: &str = "connector-token";

const HOME_ASSISTANT_KEYCHAIN_USER: &str = "home-assistant-token";

const METADATA_FILE: &str = "connector-metadata.json";

const HOME_ASSISTANT_TIMEOUT_SECONDS: u64 = 12;

const HOME_ASSISTANT_MAX_RESPONSE_BYTES: usize = 10 * 1024 * 1024;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HomeAssistantConnectionResponse {
    connected: bool,
}

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
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|error| error.to_string())?;

    fs::create_dir_all(&config_dir).map_err(|error| error.to_string())?;

    Ok(config_dir.join(METADATA_FILE))
}

fn save_secure_token(keychain_user: &str, token: String, token_label: &str) -> Result<(), String> {
    let trimmed = token.trim();

    if trimmed.is_empty() {
        return Err(format!("{token_label} token is empty."));
    }

    let entry = Entry::new(KEYCHAIN_SERVICE, keychain_user).map_err(|error| error.to_string())?;

    entry.set_password(trimmed).map_err(|error| {
        format!(
            "Unable to save {token_label} token in {}: {error}",
            credential_store_label()
        )
    })?;

    let stored = entry.get_password().map_err(|error| {
        format!(
            "Unable to verify {token_label} token in {}: {error}",
            credential_store_label()
        )
    })?;

    if stored != trimmed {
        return Err(format!(
            "{} did not persist the {token_label} token.",
            credential_store_label()
        ));
    }

    Ok(())
}

fn load_secure_token(keychain_user: &str, token_label: &str) -> Result<Option<String>, String> {
    let entry = Entry::new(KEYCHAIN_SERVICE, keychain_user).map_err(|error| error.to_string())?;

    match entry.get_password() {
        Ok(token) if token.trim().is_empty() => Ok(None),

        Ok(token) => Ok(Some(token)),

        Err(keyring::Error::NoEntry) => Ok(None),

        Err(error) => Err(format!(
            "Unable to read {token_label} token from {}: {error}",
            credential_store_label()
        )),
    }
}

fn delete_secure_token(keychain_user: &str, token_label: &str) -> Result<(), String> {
    let entry = Entry::new(KEYCHAIN_SERVICE, keychain_user).map_err(|error| error.to_string())?;

    match entry.delete_credential() {
        Ok(()) => Ok(()),

        Err(keyring::Error::NoEntry) => Ok(()),

        Err(error) => Err(format!(
            "Unable to delete {token_label} token from {}: {error}",
            credential_store_label()
        )),
    }
}

#[tauri::command]
fn save_connector_token(token: String) -> Result<(), String> {
    save_secure_token(KEYCHAIN_USER, token, "connector")
}

#[tauri::command]
fn load_connector_token() -> Result<Option<String>, String> {
    load_secure_token(KEYCHAIN_USER, "connector")
}

#[tauri::command]
fn delete_connector_token() -> Result<(), String> {
    delete_secure_token(KEYCHAIN_USER, "connector")
}

#[tauri::command]
fn save_home_assistant_token(token: String) -> Result<(), String> {
    save_secure_token(HOME_ASSISTANT_KEYCHAIN_USER, token, "Home Assistant")
}

#[tauri::command]
fn load_home_assistant_token() -> Result<Option<String>, String> {
    load_secure_token(HOME_ASSISTANT_KEYCHAIN_USER, "Home Assistant")
}

#[tauri::command]
fn delete_home_assistant_token() -> Result<(), String> {
    delete_secure_token(HOME_ASSISTANT_KEYCHAIN_USER, "Home Assistant")
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
async fn create_apple_home_pairing_session(
    api_base_url: String,
    connector_token: String,
) -> Result<
    AppleHomePairingInitSuccess,
    ConnectorCommandError,
> {
    create_apple_home_pairing_session_request(
        api_base_url,
        connector_token,
    )
    .await
}

#[tauri::command]
async fn get_apple_home_pairing_status(
    api_base_url: String,
    connector_token: String,
    session_id: String,
) -> Result<
    AppleHomePairingStatusSuccess,
    ConnectorCommandError,
> {
    get_apple_home_pairing_status_request(
        api_base_url,
        connector_token,
        session_id,
    )
    .await
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

#[tauri::command]
async fn sync_home_assistant_entities(
    api_base_url: String,
    connector_token: String,
    synced_at: String,
    entities: serde_json::Value,
) -> Result<HomeAssistantEntitySyncSuccess, ConnectorCommandError> {
    sync_home_assistant_entities_request(api_base_url, connector_token, synced_at, entities).await
}

#[tauri::command]
async fn claim_home_assistant_command(
    api_base_url: String,
    connector_token: String,
) -> Result<HomeAssistantCommandClaimSuccess, ConnectorCommandError> {
    claim_home_assistant_command_request(api_base_url, connector_token).await
}

#[tauri::command]
async fn complete_home_assistant_command(
    api_base_url: String,
    connector_token: String,
    command_id: String,
    succeeded: bool,
    error_message: Option<String>,
    result: serde_json::Value,
) -> Result<HomeAssistantCommandCompletionSuccess, ConnectorCommandError> {
    complete_home_assistant_command_request(
        api_base_url,
        connector_token,
        command_id,
        succeeded,
        error_message,
        result,
    )
    .await
}

fn normalize_home_assistant_url(base_url: &str) -> Result<Url, String> {
    let normalized = base_url.trim().trim_end_matches('/');

    if normalized.is_empty() {
        return Err("Enter your Home Assistant URL.".to_string());
    }

    let url =
        Url::parse(normalized).map_err(|_| "Enter a valid Home Assistant URL.".to_string())?;

    match url.scheme() {
        "http" | "https" => {}

        _ => {
            return Err("Home Assistant must use an http:// or https:// address.".to_string());
        }
    }

    if url.username() != "" || url.password().is_some() {
        return Err("Do not include a username or password in the Home Assistant URL.".to_string());
    }

    if url.query().is_some() || url.fragment().is_some() {
        return Err(
            "The Home Assistant URL cannot contain a query string or fragment.".to_string(),
        );
    }

    let host = url
        .host_str()
        .ok_or_else(|| "The Home Assistant URL is missing a host.".to_string())?;

    let host_lower = host.to_ascii_lowercase();

    if host_lower == "localhost"
        || host_lower.ends_with(".localhost")
        || host_lower == "homeassistant.local"
        || host_lower.ends_with(".local")
    {
        return Ok(url);
    }

    if let Ok(ip) = host.parse::<IpAddr>() {
        let is_allowed = match ip {
            IpAddr::V4(ipv4) => ipv4.is_private() || ipv4.is_loopback() || ipv4.is_link_local(),

            IpAddr::V6(ipv6) => {
                ipv6.is_loopback() || ipv6.is_unique_local() || ipv6.is_unicast_link_local()
            }
        };

        if is_allowed {
            return Ok(url);
        }
    }

    Err(
        "Use a private Home Assistant address such as 192.168.x.x, 10.x.x.x, 172.16-31.x.x, or homeassistant.local."
            .to_string(),
    )
}

fn create_home_assistant_client() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(HOME_ASSISTANT_TIMEOUT_SECONDS))
        .redirect(Policy::none())
        .build()
        .map_err(|error| format!("Unable to create the Home Assistant client: {error}"))
}

fn resolve_home_assistant_token(access_token: Option<String>) -> Result<String, String> {
    if let Some(token) = access_token {
        let trimmed = token.trim();

        if !trimmed.is_empty() {
            return Ok(trimmed.to_string());
        }
    }

    load_home_assistant_token()?
        .ok_or_else(|| "Enter your Home Assistant access token.".to_string())
}

fn home_assistant_endpoint(base_url: &str, api_path: &str) -> Result<Url, String> {
    let mut url = normalize_home_assistant_url(base_url)?;

    url.set_path(api_path);
    url.set_query(None);
    url.set_fragment(None);

    Ok(url)
}

async fn send_home_assistant_request(
    base_url: &str,
    api_path: &str,
    access_token: Option<String>,
) -> Result<reqwest::Response, String> {
    let endpoint = home_assistant_endpoint(base_url, api_path)?;

    let token = resolve_home_assistant_token(access_token)?;

    let client = create_home_assistant_client()?;

    let response = client
        .get(endpoint)
        .bearer_auth(token)
        .header(
            reqwest::header::ACCEPT,
            "application/json",
        )
        .send()
        .await
        .map_err(|error| {
            if error.is_timeout() {
                "Home Assistant did not respond before the connection timed out."
                    .to_string()
            } else if error.is_connect() {
                "Unable to reach Home Assistant. Confirm that Home Assistant is running and the local address is correct."
                    .to_string()
            } else {
                format!(
                    "Unable to contact Home Assistant: {error}"
                )
            }
        })?;

    if response.status() == StatusCode::UNAUTHORIZED {
        return Err("Home Assistant rejected the access token.".to_string());
    }

    if response.status() == StatusCode::FORBIDDEN {
        return Err("Home Assistant denied access to this request.".to_string());
    }

    if response.status().is_redirection() {
        return Err(
            "Home Assistant redirected the request. Enter the direct local Home Assistant URL."
                .to_string(),
        );
    }

    if !response.status().is_success() {
        return Err(format!(
            "Home Assistant returned HTTP {}.",
            response.status()
        ));
    }

    Ok(response)
}

#[tauri::command]
async fn test_home_assistant_connection(
    base_url: String,
    access_token: Option<String>,
) -> Result<HomeAssistantConnectionResponse, String> {
    let response = send_home_assistant_request(&base_url, "/api/", access_token).await?;

    let bytes = response
        .bytes()
        .await
        .map_err(|error| format!("Unable to read the Home Assistant response: {error}"))?;

    if bytes.len() > HOME_ASSISTANT_MAX_RESPONSE_BYTES {
        return Err("Home Assistant returned a response that was too large.".to_string());
    }

    Ok(HomeAssistantConnectionResponse { connected: true })
}

#[tauri::command]
async fn get_home_assistant_states(
    base_url: String,
    access_token: Option<String>,
) -> Result<serde_json::Value, String> {
    let response = send_home_assistant_request(&base_url, "/api/states", access_token).await?;

    if let Some(content_length) = response.content_length() {
        if content_length > HOME_ASSISTANT_MAX_RESPONSE_BYTES as u64 {
            return Err("Home Assistant returned too much device data.".to_string());
        }
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|error| format!("Unable to read Home Assistant device data: {error}"))?;

    if bytes.len() > HOME_ASSISTANT_MAX_RESPONSE_BYTES {
        return Err("Home Assistant returned too much device data.".to_string());
    }

    let states = serde_json::from_slice::<serde_json::Value>(&bytes)
        .map_err(|_| "Home Assistant returned an unreadable device response.".to_string())?;

    if !states.is_array() {
        return Err("Home Assistant returned an unexpected device response.".to_string());
    }

    Ok(states)
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HomeAssistantServiceResponse {
    ok: bool,
    entity_id: String,
    domain: String,
    service: String,
}

fn validate_home_assistant_service_command(
    entity_id: &str,
    domain: &str,
    service: &str,
) -> Result<(), String> {
    if domain != "light" && domain != "switch" {
        return Err("Only light and switch controls are currently supported.".to_string());
    }

    if service != "turn_on" && service != "turn_off" {
        return Err("Only turn_on and turn_off controls are currently supported.".to_string());
    }

    let expected_prefix = format!("{domain}.");

    if !entity_id.starts_with(&expected_prefix)
        || entity_id.len() > 255
        || entity_id.chars().any(|character| {
            !(character.is_ascii_lowercase()
                || character.is_ascii_digit()
                || character == '_'
                || character == '.')
        })
    {
        return Err("The Home Assistant entity ID is invalid.".to_string());
    }

    Ok(())
}

#[tauri::command]
async fn execute_home_assistant_service(
    base_url: String,
    entity_id: String,
    domain: String,
    service: String,
) -> Result<HomeAssistantServiceResponse, String> {
    validate_home_assistant_service_command(&entity_id, &domain, &service)?;

    let api_path = format!("/api/services/{domain}/{service}");

    let endpoint = home_assistant_endpoint(&base_url, &api_path)?;

    let token = resolve_home_assistant_token(None)?;

    let client = create_home_assistant_client()?;

    let response = client
        .post(endpoint)
        .bearer_auth(token)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(reqwest::header::CONTENT_TYPE, "application/json")
        .json(&serde_json::json!({
            "entity_id": entity_id,
        }))
        .send()
        .await
        .map_err(|error| {
            if error.is_timeout() {
                "Home Assistant did not respond before the command timed out.".to_string()
            } else if error.is_connect() {
                "Unable to reach Home Assistant while sending the command.".to_string()
            } else {
                format!("Unable to send the Home Assistant command: {error}")
            }
        })?;

    if response.status() == StatusCode::UNAUTHORIZED {
        return Err("Home Assistant rejected the stored access token.".to_string());
    }

    if response.status() == StatusCode::FORBIDDEN {
        return Err("Home Assistant denied permission to control this entity.".to_string());
    }

    if response.status().is_redirection() {
        return Err("Home Assistant redirected the command request.".to_string());
    }

    if !response.status().is_success() {
        return Err(format!(
            "Home Assistant returned HTTP {} while executing the command.",
            response.status()
        ));
    }

    Ok(HomeAssistantServiceResponse {
        ok: true,
        entity_id,
        domain,
        service,
    })
}

#[cfg(test)]
mod credential_tests {
    use super::*;

    #[test]
    fn roundtrips_connector_token_in_secure_store() {
        let entry = Entry::new(KEYCHAIN_SERVICE, "connector-token-test").expect("credential entry");

        let _ = entry.delete_credential();

        entry.set_password("roundtrip-test-value").expect("write");

        assert_eq!(entry.get_password().expect("read"), "roundtrip-test-value");

        entry.delete_credential().expect("cleanup");
    }

    #[test]
    fn roundtrips_home_assistant_token_in_secure_store() {
        let entry =
            Entry::new(KEYCHAIN_SERVICE, "home-assistant-token-test").expect("credential entry");

        let _ = entry.delete_credential();

        entry
            .set_password("home-assistant-roundtrip-test")
            .expect("write");

        assert_eq!(
            entry.get_password().expect("read"),
            "home-assistant-roundtrip-test"
        );

        entry.delete_credential().expect("cleanup");
    }
}

#[cfg(test)]
mod home_assistant_url_tests {
    use super::*;

    #[test]
    fn allows_private_ipv4_address() {
        assert!(normalize_home_assistant_url("http://192.168.1.158:8123").is_ok());
    }

    #[test]
    fn allows_homeassistant_local() {
        assert!(normalize_home_assistant_url("http://homeassistant.local:8123").is_ok());
    }

    #[test]
    fn rejects_public_ipv4_address() {
        assert!(normalize_home_assistant_url("http://8.8.8.8:8123").is_err());
    }

    #[test]
    fn rejects_public_hostname() {
        assert!(normalize_home_assistant_url("https://example.com").is_err());
    }

    #[test]
    fn rejects_non_http_protocol() {
        assert!(normalize_home_assistant_url("file:///etc/passwd").is_err());
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
            save_home_assistant_token,
            load_home_assistant_token,
            delete_home_assistant_token,
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
            sync_home_assistant_entities,
            claim_home_assistant_command,
            complete_home_assistant_command,
            execute_home_assistant_service,
            test_home_assistant_connection,
            get_home_assistant_states,
            tray::set_connector_runtime_preferences,
            tray::quit_connector_app,
            tray::hide_connector_window,
            tray::show_connector_window,
        
            create_apple_home_pairing_session,
            get_apple_home_pairing_status,])
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
