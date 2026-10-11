use std::sync::Arc;

use clap::{Parser, Subcommand};
use recipeyak::config::Config;
use recipeyak::{AppState, app, openapi};
use sqlx::postgres::PgPoolOptions;
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
    let pool = PgPoolOptions::new()
        .max_connections(30)
        .connect_lazy(&config.database_url)
        .expect("invalid DATABASE_URL");
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
