use std::env;

use url::Url;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    /// `https://{STORAGE_HOSTNAME}`, the base for upload URLs.
    pub storage_url: Url,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            storage_url: env::var("STORAGE_HOSTNAME")
                .ok()
                .and_then(|host| Url::parse(&format!("https://{host}")).ok())
                .expect("STORAGE_HOSTNAME must be set to a valid hostname"),
            port: env::var("PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(8001),
        }
    }
}
