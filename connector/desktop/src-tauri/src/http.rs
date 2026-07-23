use std::time::Duration;

use reqwest::header::{AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

const PROD_ORIGIN: &str = "https://www.hometechvault.com";
const LEGACY_PROD_ORIGIN: &str = "https://hometechvault.com";

const DEV_ORIGINS: [&str; 4] = [
    "http://localhost:3000",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3003",
];

const REQUEST_TIMEOUT: Duration = Duration::from_secs(30);

pub fn connector_platform() -> &'static str {
    if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else {
        "unknown"
    }
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConnectorCommandError {
    pub kind: String,
    pub message: String,
    pub status: Option<u16>,
    pub reason: Option<String>,
    pub diagnostics: Option<Value>,
}

fn command_error(
    kind: &str,
    message: impl Into<String>,
    status: Option<u16>,
) -> ConnectorCommandError {
    ConnectorCommandError {
        kind: kind.to_string(),
        message: message.into(),
        status,
        reason: None,
        diagnostics: None,
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PairConfirmSuccess {
    pub connector_id: String,
    pub connector_token: String,
    pub household_id: String,
    pub connector_name: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HeartbeatSuccess {
    pub ok: bool,
    pub connector_id: String,
    pub household_id: String,
    pub server_time: String,
}

#[derive(Debug, Deserialize, Default)]
struct ErrorBody {
    error: Option<String>,
    reason: Option<String>,
    diagnostics: Option<Value>,
}

fn log_heartbeat_auth_failure(status: u16, body: &ErrorBody) {
    let diagnostics = body
        .diagnostics
        .as_ref()
        .and_then(|value| value.as_object());

    eprintln!(
        "[htv-connector] heartbeat_auth_failure status={status} reason={} connector_id={} token_hash_prefix={} installation_status={} revoked_at_present={}",
        body.reason.as_deref().unwrap_or("unknown"),
        diagnostics
            .and_then(|value| value.get("connectorId"))
            .and_then(|value| value.as_str())
            .unwrap_or("-"),
        diagnostics
            .and_then(|value| value.get("tokenHashPrefix"))
            .and_then(|value| value.as_str())
            .unwrap_or("-"),
        diagnostics
            .and_then(|value| value.get("installationStatus"))
            .and_then(|value| value.as_str())
            .unwrap_or("-"),
        diagnostics
            .and_then(|value| value.get("revokedAtPresent"))
            .and_then(|value| value.as_bool())
            .map(|value| value.to_string())
            .unwrap_or_else(|| "-".to_string()),
    );
}

fn normalize_base_url(base_url: &str) -> String {
    base_url.trim().trim_end_matches('/').to_string()
}

pub fn validate_api_base_url(base_url: &str) -> Result<String, ConnectorCommandError> {
    let normalized = normalize_base_url(base_url);

    if normalized.is_empty() {
        return Err(command_error(
            "network",
            "API base URL is required.",
            None,
        ));
    }

    if normalized == PROD_ORIGIN || normalized == LEGACY_PROD_ORIGIN {
        return Ok(PROD_ORIGIN.to_string());
    }

    if cfg!(debug_assertions) && DEV_ORIGINS.contains(&normalized.as_str()) {
        return Ok(normalized);
    }

    if !cfg!(debug_assertions) && normalized.starts_with("http://") {
        return Err(command_error(
            "network",
            "Production builds require HTTPS for the API base URL.",
            None,
        ));
    }

    Err(command_error(
        "network",
        "API base URL is not allowed.",
        None,
    ))
}

fn map_pair_confirm_error(status: u16, body: &ErrorBody) -> ConnectorCommandError {
    let server_message = body.error.clone();

    match status {
        400 => command_error(
            "invalid_code",
            server_message.unwrap_or_else(|| {
                "That pairing code is not valid. Check the code and try again.".into()
            }),
            Some(status),
        ),
        401 => command_error(
            "unauthorized",
            server_message.unwrap_or_else(|| {
                "Pairing was rejected. Generate a new code and try again.".into()
            }),
            Some(status),
        ),
        410 => {
            let message = server_message.unwrap_or_else(|| {
                "This pairing code has expired. Generate a new code in Home Tech Vault.".into()
            });
            let kind = if message.to_ascii_lowercase().contains("already been used") {
                "consumed_code"
            } else {
                "expired_code"
            };

            command_error(kind, message, Some(status))
        }
        _ if status == 403 => command_error(
            "network",
            server_message.unwrap_or_else(|| {
                "Home Tech Vault rejected the request. Check the API URL in connector/desktop/.env."
                    .into()
            }),
            Some(status),
        ),
        _ if status >= 500 => command_error(
            "server",
            "Home Tech Vault is temporarily unavailable. Try again shortly.",
            Some(status),
        ),
        _ => command_error(
            "server",
            server_message
                .unwrap_or_else(|| "Home Tech Vault returned an unexpected response.".into()),
            Some(status),
        ),
    }
}

fn map_request_error(error: reqwest::Error) -> ConnectorCommandError {
    if error.is_timeout() {
        return command_error(
            "timeout",
            "The request timed out. Try again.",
            None,
        );
    }

    if error.is_connect() {
        return command_error(
            "network",
            "Unable to reach Home Tech Vault. Check your connection and try again.",
            None,
        );
    }

    if error.to_string().to_lowercase().contains("certificate")
        || error.to_string().to_lowercase().contains("tls")
    {
        return command_error(
            "tls",
            "Secure connection to Home Tech Vault failed.",
            None,
        );
    }

    command_error(
        "network",
        "Unable to reach Home Tech Vault. Check your connection and try again.",
        None,
    )
}

async fn post_json(
    url: &str,
    body: Value,
    bearer_token: Option<&str>,
) -> Result<(u16, Value), ConnectorCommandError> {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .build()
        .map_err(|_| {
            command_error(
                "server",
                "Unable to initialize the connector HTTP client.",
                None,
            )
        })?;

    let mut request = client
        .post(url)
        .header(CONTENT_TYPE, "application/json")
        .json(&body);

    if let Some(token) = bearer_token {
        request = request.header(AUTHORIZATION, format!("Bearer {token}"));
    }

    let response = request.send().await.map_err(map_request_error)?;
    let status = response.status().as_u16();
    let body = response.bytes().await.map_err(map_request_error)?;

    let payload = match serde_json::from_slice::<Value>(&body) {
        Ok(json) => json,
        Err(_) => {
            let text = String::from_utf8_lossy(&body).trim().to_string();
            if text.is_empty() {
                json!({})
            } else {
                json!({ "error": text })
            }
        }
    };

    Ok((status, payload))
}

pub async fn pair_connector_request(
    api_base_url: String,
    code: String,
    connector_name: String,
    app_version: String,
) -> Result<PairConfirmSuccess, ConnectorCommandError> {
    let base_url = validate_api_base_url(&api_base_url)?;
    let url = format!("{base_url}/api/connector/pair/confirm");

    eprintln!("[htv-connector] pair request started: {url}");

    let (status, payload) = post_json(
        &url,
        json!({
            "code": code,
            "connectorName": connector_name,
            "platform": connector_platform(),
            "appVersion": app_version,
        }),
        None,
    )
    .await?;

    if status >= 200 && status < 300 {
        let parsed = serde_json::from_value::<PairConfirmSuccess>(payload).map_err(|_| {
            command_error(
                "malformed",
                "Home Tech Vault returned an incomplete pairing response.",
                Some(status),
            )
        })?;

        if parsed.connector_id.is_empty()
            || parsed.connector_token.is_empty()
            || parsed.household_id.is_empty()
            || parsed.connector_name.is_empty()
        {
            return Err(command_error(
                "malformed",
                "Home Tech Vault returned an incomplete pairing response.",
                Some(status),
            ));
        }

        eprintln!("[htv-connector] pair request succeeded");
        return Ok(parsed);
    }

    let error_body =
        serde_json::from_value::<ErrorBody>(payload).unwrap_or_default();
    Err(map_pair_confirm_error(status, &error_body))
}

pub async fn send_heartbeat_request(
    api_base_url: String,
    connector_token: String,
    app_version: String,
    device_name: String,
) -> Result<HeartbeatSuccess, ConnectorCommandError> {
    let base_url = validate_api_base_url(&api_base_url)?;
    let url = format!("{base_url}/api/connector/heartbeat");

    eprintln!("[htv-connector] heartbeat request started: {url}");

    let (status, payload) = post_json(
        &url,
        json!({
            "appVersion": app_version,
            "platform": connector_platform(),
            "deviceName": device_name,
        }),
        Some(&connector_token),
    )
    .await?;

    if status == 401 {
        let error_body =
            serde_json::from_value::<ErrorBody>(payload.clone())
                .unwrap_or_default();
        log_heartbeat_auth_failure(status, &error_body);

        return Err(ConnectorCommandError {
            kind: "unauthorized".into(),
            message: error_body.error.unwrap_or_else(|| {
                "Connector access revoked or invalid.".into()
            }),
            status: Some(status),
            reason: error_body.reason,
            diagnostics: error_body.diagnostics,
        });
    }

    if status >= 200 && status < 300 {
        let parsed = serde_json::from_value::<HeartbeatSuccess>(payload).map_err(|_| {
            command_error(
                "malformed",
                "Home Tech Vault returned an unexpected response.",
                Some(status),
            )
        })?;

        if !parsed.ok {
            return Err(command_error(
                "malformed",
                "Home Tech Vault returned an unexpected response.",
                Some(status),
            ));
        }

        eprintln!("[htv-connector] heartbeat request succeeded");
        return Ok(parsed);
    }

    if status >= 500 {
        return Err(command_error(
            "server",
            "Temporary server issue. Try again shortly.",
            Some(status),
        ));
    }

    let error_body =
        serde_json::from_value::<ErrorBody>(payload).unwrap_or_default();

    Err(command_error(
        "server",
        error_body
            .error
            .unwrap_or_else(|| "Home Tech Vault returned an unexpected response.".into()),
        Some(status),
    ))
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiscoverySyncSuccess {
    pub ok: bool,
    pub connector_id: String,
    pub household_id: String,
    pub scanned_at: String,
    pub received: u32,
    pub upserted: u32,
}

pub async fn sync_discovery_request(
    api_base_url: String,
    connector_token: String,
    scanned_at: String,
    devices: Value,
    run_matching: bool,
) -> Result<DiscoverySyncSuccess, ConnectorCommandError> {
    let base_url = validate_api_base_url(&api_base_url)?;
    let url = format!("{base_url}/api/connector/discovery/sync");

    eprintln!("[htv-connector] discovery sync started: {url}");

    let (status, payload) = post_json(
        &url,
        json!({
            "scannedAt": scanned_at,
            "devices": devices,
            "runMatching": run_matching,
        }),
        Some(&connector_token),
    )
    .await?;

    if status == 401 {
        let error_body =
            serde_json::from_value::<ErrorBody>(payload.clone()).unwrap_or_default();
        log_heartbeat_auth_failure(status, &error_body);

        return Err(ConnectorCommandError {
            kind: "unauthorized".into(),
            message: error_body.error.unwrap_or_else(|| {
                "Connector access revoked or invalid.".into()
            }),
            status: Some(status),
            reason: error_body.reason,
            diagnostics: error_body.diagnostics,
        });
    }

    if status >= 200 && status < 300 {
        let parsed = serde_json::from_value::<DiscoverySyncSuccess>(payload).map_err(|_| {
            command_error(
                "malformed",
                "Home Tech Vault returned an incomplete discovery sync response.",
                Some(status),
            )
        })?;

        if !parsed.ok {
            return Err(command_error(
                "malformed",
                "Home Tech Vault returned an incomplete discovery sync response.",
                Some(status),
            ));
        }

        eprintln!("[htv-connector] discovery sync succeeded");
        return Ok(parsed);
    }

    if status >= 500 {
        return Err(command_error(
            "server",
            "Temporary server issue. Try again shortly.",
            Some(status),
        ));
    }

    let error_body =
        serde_json::from_value::<ErrorBody>(payload).unwrap_or_default();

    Err(command_error(
        "server",
        error_body
            .error
            .unwrap_or_else(|| "Home Tech Vault returned an unexpected response.".into()),
        Some(status),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[cfg(debug_assertions)]
    fn allows_localhost_in_debug_builds() {
        let result = validate_api_base_url("http://localhost:3003/");
        assert!(result.is_ok());
    }

    #[test]
    #[cfg(not(debug_assertions))]
    fn rejects_localhost_in_release_builds() {
        let result = validate_api_base_url("http://localhost:3003");
        assert!(result.is_err());
    }

    #[test]
    fn allows_production_origin() {
        let result = validate_api_base_url("https://www.hometechvault.com");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), PROD_ORIGIN);
    }

    #[test]
    fn normalizes_legacy_production_origin_to_www() {
        let result = validate_api_base_url("https://hometechvault.com");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), PROD_ORIGIN);
    }

    #[test]
    fn rejects_unknown_origin() {
        let result = validate_api_base_url("https://evil.example.com");
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn invalid_pairing_code_returns_specific_message() {
        let result = pair_connector_request(
            "http://localhost:3003".into(),
            "BADCODE1".into(),
            "Test Mac".into(),
            "0.1.0".into(),
        )
        .await;

        let err = match result {
            Err(error) => error,
            Ok(_) => {
                panic!("expected invalid pairing code error");
            }
        };

        assert_eq!(err.kind, "invalid_code");
        assert_eq!(err.status, Some(400));
        assert!(err.message.contains("Invalid pairing code"));
    }

    #[tokio::test]
    async fn heartbeat_with_invalid_token_returns_unauthorized() {
        let result = send_heartbeat_request(
            "http://localhost:3003".into(),
            "htv_test_invalid_token".into(),
            "0.1.0".into(),
            "Test Mac".into(),
        )
        .await;

        let err = match result {
            Err(error) => error,
            Ok(_) => {
                panic!("expected unauthorized heartbeat error");
            }
        };

        assert_eq!(err.kind, "unauthorized");
        assert_eq!(err.status, Some(401));
    }
}
