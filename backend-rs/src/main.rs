use std::sync::Arc;
use std::time::Duration;

use clap::{Parser, Subcommand};
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod, Runtime};
use recipeyak::config::Config;
use recipeyak::{AppState, app, openapi};
use tokio_postgres::NoTls;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    match Cli::parse().command.unwrap_or(Command::Serve) {
        Command::Serve => serve().await,
        Command::Schema => println!("{}", openapi().to_pretty_json().unwrap()),
    }
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
}

async fn serve() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let config = Config::from_env();
    let pg_config = config.database_url.parse().expect("invalid DATABASE_URL");
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
