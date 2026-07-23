use std::time::Duration;

use reqwest::header::{AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

const PROD_ORIGIN: &str = "https://hometechvault.com";

const DEV_ORIGINS: [&str; 4] = [
    "http://localhost:3000",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3003",
];

const REQUEST_TIMEOUT: Duration = Duration::from_secs(30);

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConnectorCommandError {
    pub kind: String,
    pub message: String,
    pub status: Option<u16>,
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

#[derive(Debug, Deserialize)]
struct ErrorBody {
    error: Option<String>,
}

fn normalize_base_url(base_url: &str) -> String {
    base_url.trim().trim_end_matches('/').to_string()
}

pub fn validate_api_base_url(base_url: &str) -> Result<String, ConnectorCommandError> {
    let normalized = normalize_base_url(base_url);

    if normalized.is_empty() {
        return Err(ConnectorCommandError {
            kind: "network".into(),
            message: "API base URL is required.".into(),
            status: None,
        });
    }

    if normalized == PROD_ORIGIN {
        return Ok(normalized);
    }

    if cfg!(debug_assertions) && DEV_ORIGINS.contains(&normalized.as_str()) {
        return Ok(normalized);
    }

    if !cfg!(debug_assertions) && normalized.starts_with("http://") {
        return Err(ConnectorCommandError {
            kind: "network".into(),
            message: "Production builds require HTTPS for the API base URL.".into(),
            status: None,
        });
    }

    Err(ConnectorCommandError {
        kind: "network".into(),
        message: "API base URL is not allowed.".into(),
        status: None,
    })
}

fn map_pair_confirm_error(status: u16, body: &ErrorBody) -> ConnectorCommandError {
    let server_message = body.error.clone();

    match status {
        400 => ConnectorCommandError {
            kind: "invalid_code".into(),
            message: server_message.unwrap_or_else(|| {
                "That pairing code is not valid. Check the code and try again.".into()
            }),
            status: Some(status),
        },
        401 => ConnectorCommandError {
            kind: "unauthorized".into(),
            message: server_message.unwrap_or_else(|| {
                "Pairing was rejected. Generate a new code and try again.".into()
            }),
            status: Some(status),
        },
        410 => {
            let message = server_message.unwrap_or_else(|| {
                "This pairing code has expired. Generate a new code in Home Tech Vault.".into()
            });
            let kind = if message.to_ascii_lowercase().contains("already been used") {
                "consumed_code"
            } else {
                "expired_code"
            };

            ConnectorCommandError {
                kind: kind.into(),
                message,
                status: Some(status),
            }
        }
        _ if status == 403 => ConnectorCommandError {
            kind: "network".into(),
            message: server_message.unwrap_or_else(|| {
                "Home Tech Vault rejected the request. Check the API URL in connector/desktop/.env."
                    .into()
            }),
            status: Some(status),
        },
        _ if status >= 500 => ConnectorCommandError {
            kind: "server".into(),
            message: "Home Tech Vault is temporarily unavailable. Try again shortly.".into(),
            status: Some(status),
        },
        _ => ConnectorCommandError {
            kind: "server".into(),
            message: server_message
                .unwrap_or_else(|| "Home Tech Vault returned an unexpected response.".into()),
            status: Some(status),
        },
    }
}

fn map_request_error(error: reqwest::Error) -> ConnectorCommandError {
    if error.is_timeout() {
        return ConnectorCommandError {
            kind: "timeout".into(),
            message: "The request timed out. Try again.".into(),
            status: None,
        };
    }

    if error.is_connect() {
        return ConnectorCommandError {
            kind: "network".into(),
            message: "Unable to reach Home Tech Vault. Check your connection and try again."
                .into(),
            status: None,
        };
    }

    if error.to_string().to_lowercase().contains("certificate")
        || error.to_string().to_lowercase().contains("tls")
    {
        return ConnectorCommandError {
            kind: "tls".into(),
            message: "Secure connection to Home Tech Vault failed.".into(),
            status: None,
        };
    }

    ConnectorCommandError {
        kind: "network".into(),
        message: "Unable to reach Home Tech Vault. Check your connection and try again.".into(),
        status: None,
    }
}

async fn post_json(
    url: &str,
    body: Value,
    bearer_token: Option<&str>,
) -> Result<(u16, Value), ConnectorCommandError> {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .build()
        .map_err(|_| ConnectorCommandError {
            kind: "server".into(),
            message: "Unable to initialize the connector HTTP client.".into(),
            status: None,
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
            "platform": "macos",
            "appVersion": app_version,
        }),
        None,
    )
    .await?;

    if status >= 200 && status < 300 {
        let parsed = serde_json::from_value::<PairConfirmSuccess>(payload).map_err(|_| {
            ConnectorCommandError {
                kind: "malformed".into(),
                message: "Home Tech Vault returned an incomplete pairing response.".into(),
                status: Some(status),
            }
        })?;

        if parsed.connector_id.is_empty()
            || parsed.connector_token.is_empty()
            || parsed.household_id.is_empty()
            || parsed.connector_name.is_empty()
        {
            return Err(ConnectorCommandError {
                kind: "malformed".into(),
                message: "Home Tech Vault returned an incomplete pairing response.".into(),
                status: Some(status),
            });
        }

        eprintln!("[htv-connector] pair request succeeded");
        return Ok(parsed);
    }

    let error_body = serde_json::from_value::<ErrorBody>(payload).unwrap_or(ErrorBody { error: None });
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
            "platform": "macos",
            "deviceName": device_name,
        }),
        Some(&connector_token),
    )
    .await?;

    if status == 401 {
        return Err(ConnectorCommandError {
            kind: "unauthorized".into(),
            message: "Connector access revoked or invalid.".into(),
            status: Some(status),
        });
    }

    if status >= 200 && status < 300 {
        let parsed = serde_json::from_value::<HeartbeatSuccess>(payload).map_err(|_| {
            ConnectorCommandError {
                kind: "malformed".into(),
                message: "Home Tech Vault returned an unexpected response.".into(),
                status: Some(status),
            }
        })?;

        if !parsed.ok {
            return Err(ConnectorCommandError {
                kind: "malformed".into(),
                message: "Home Tech Vault returned an unexpected response.".into(),
                status: Some(status),
            });
        }

        eprintln!("[htv-connector] heartbeat request succeeded");
        return Ok(parsed);
    }

    if status >= 500 {
        return Err(ConnectorCommandError {
            kind: "server".into(),
            message: "Temporary server issue. Try again shortly.".into(),
            status: Some(status),
        });
    }

    let error_body = serde_json::from_value::<ErrorBody>(payload).unwrap_or(ErrorBody { error: None });

    Err(ConnectorCommandError {
        kind: "server".into(),
        message: error_body
            .error
            .unwrap_or_else(|| "Home Tech Vault returned an unexpected response.".into()),
        status: Some(status),
    })
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
        let result = validate_api_base_url("https://hometechvault.com");
        assert!(result.is_ok());
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
