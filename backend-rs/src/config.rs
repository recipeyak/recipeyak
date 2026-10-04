use std::env;
use std::net::SocketAddr;

use url::Url;

const DEFAULT_BIND_ADDR: &str = "127.0.0.1:8001";

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    /// Shared with Django to verify session signatures.
    pub secret_key: String,
    /// Base url for uploaded images, e.g. `https://images-cdn.recipeyak.com`.
    pub storage_url: Url,
    pub bind_addr: SocketAddr,
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("missing environment variable: {0}")]
    Missing(&'static str),
    #[error("invalid environment variable {name}: {reason}")]
    Invalid { name: &'static str, reason: String },
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let storage_hostname = required("STORAGE_HOSTNAME")?;
        let storage_url = Url::parse(&format!("https://{storage_hostname}")).map_err(|e| {
            ConfigError::Invalid {
                name: "STORAGE_HOSTNAME",
                reason: e.to_string(),
            }
        })?;
        let bind_addr = env::var("BIND_ADDR")
            .unwrap_or_else(|_| DEFAULT_BIND_ADDR.to_owned())
            .parse()
            .map_err(|e: std::net::AddrParseError| ConfigError::Invalid {
                name: "BIND_ADDR",
                reason: e.to_string(),
            })?;
        Ok(Self {
            database_url: required("DATABASE_URL")?,
            secret_key: required("DJANGO_SECRET_KEY")?,
            storage_url,
            bind_addr,
        })
    }
}

fn required(name: &'static str) -> Result<String, ConfigError> {
    env::var(name)
        .ok()
        .filter(|v| !v.is_empty())
        .ok_or(ConfigError::Missing(name))
}
