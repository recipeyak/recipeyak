use std::env;

use url::Url;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    /// `https://{RECIPEYAK_RS_STORAGE_HOSTNAME}`, the base for upload URLs.
    pub storage_url: Url,
    pub port: u16,
    /// Realtime updates aren't published when unset.
    pub ably_api_key: Option<String>,
    /// Ably's REST API, pointed at a fake in tests.
    pub ably_url: Url,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("RECIPEYAK_RS_DATABASE_URL")
                .expect("RECIPEYAK_RS_DATABASE_URL must be set"),
            storage_url: env::var("RECIPEYAK_RS_STORAGE_HOSTNAME")
                .ok()
                .and_then(|host| Url::parse(&format!("https://{host}")).ok())
                .expect("RECIPEYAK_RS_STORAGE_HOSTNAME must be set to a valid hostname"),
            port: env::var("RECIPEYAK_RS_PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(8001),
            ably_api_key: env::var("RECIPEYAK_RS_ABLY_API_KEY").ok(),
            ably_url: Url::parse("https://rest.ably.io").unwrap(),
        }
    }
}
