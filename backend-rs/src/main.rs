use std::env;
use std::sync::Arc;
use std::time::Duration;

use clap::{Parser, Subcommand};
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod, Runtime};
use recipeyak::config::Config;
use recipeyak::{AppState, app, openapi};
use tokio_postgres::NoTls;
use tracing_subscriber::EnvFilter;
use tracing_subscriber::prelude::*;

fn main() {
    match Cli::parse().command.unwrap_or(Command::Serve) {
        Command::Serve => {
            let _guard = init_sentry();
            // Sentry has to be initialized before the runtime starts so its
            // threads inherit the hub, which rules out `#[tokio::main]`.
            tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .build()
                .unwrap()
                .block_on(serve());
        }
        Command::Schema => println!("{}", openapi().to_pretty_json().unwrap()),
        Command::SentryTest => {
            let _guard = init_sentry().expect("RECIPEYAK_RS_SENTRY_DSN must be set");
            panic!("Everything is on fire!");
        }
    }
}

/// The guard flushes pending events when dropped, so it must outlive the app.
fn init_sentry() -> Option<sentry::ClientInitGuard> {
    // Skip init entirely when unset, otherwise the SDK falls back to
    // SENTRY_DSN, which belongs to the Django backend.
    let dsn = env::var("RECIPEYAK_RS_SENTRY_DSN").ok()?;
    let mut options = sentry::ClientOptions::new()
        .send_default_pii(true)
        .traces_sample_rate(1.0);
    options.release = env::var("RECIPEYAK_RS_SENTRY_RELEASE").ok().map(Into::into);
    options.environment = env::var("RECIPEYAK_RS_SENTRY_ENVIRONMENT")
        .ok()
        .map(Into::into);
    Some(sentry::init((dsn, options)))
}

#[derive(Parser)]
struct Cli {
    #[command(subcommand)]
    command: Option<Command>,
}

#[derive(Subcommand)]
enum Command {
    /// Run the HTTP server (default)
    Serve,
    /// Print the OpenAPI schema used to generate the UI's API client
    Schema,
    /// Panic to check that errors reach Sentry
    SentryTest,
}

async fn serve() {
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_env("RECIPEYAK_RS_LOG").unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .with(sentry::integrations::tracing::layer())
        .init();

    let config = Config::from_env();
    let pg_config = config
        .database_url
        .parse()
        .expect("invalid RECIPEYAK_RS_DATABASE_URL");
    // Postgres runs on the same host without SSL.
    let manager = Manager::from_config(
        pg_config,
        NoTls,
        ManagerConfig {
            recycling_method: RecyclingMethod::Fast,
        },
    );
    // Connections are opened on first use, like sqlx's `connect_lazy`. The
    // timeouts match sqlx's default `acquire_timeout`; deadpool has none.
    let timeout = Some(Duration::from_secs(30));
    let pool = Pool::builder(manager)
        .max_size(30)
        .runtime(Runtime::Tokio1)
        .wait_timeout(timeout)
        .create_timeout(timeout)
        .recycle_timeout(timeout)
        .build()
        .unwrap();
    let addr = format!("0.0.0.0:{}", config.port);
    let state = AppState {
        pool,
        config: Arc::new(config),
        http: reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .unwrap(),
    };

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("listening on {addr}");
    axum::serve(listener, app(state))
        .with_graceful_shutdown(async {
            tokio::signal::ctrl_c().await.ok();
        })
        .await
        .unwrap();
}
