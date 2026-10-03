use std::env;

// Same dev key as backend/recipeyak/django/settings.py so local sessions
// created by Django are accepted here.
const DEBUG_SECRET_KEY: &str = "+p(5+wb+(l2$@iv!1*3=5xnrw2gvi+l$kuo9s7=u6*)ri4v6as";

#[derive(Clone, Debug)]
pub struct Config {
    pub debug: bool,
    pub secret_key: String,
    pub database_url: String,
    pub storage_hostname: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        let debug = env::var("DEBUG").as_deref() == Ok("1");
        let secret_key = if debug {
            DEBUG_SECRET_KEY.to_string()
        } else {
            env::var("DJANGO_SECRET_KEY").expect("DJANGO_SECRET_KEY must be set")
        };
        Self {
            debug,
            secret_key,
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            storage_hostname: env::var("STORAGE_HOSTNAME").unwrap_or_default(),
            port: env::var("PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(8001),
        }
    }
}
