//! Writes the OpenAPI spec to `openapi.json`.
//!
//! Pass `--check` to instead fail if `openapi.json` is out of date.

use std::path::Path;
use std::process::ExitCode;
use std::{env, fs};

fn main() -> ExitCode {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("openapi.json");
    let spec = recipeyak::openapi()
        .to_pretty_json()
        .expect("spec serializes to json")
        + "\n";

    if env::args().any(|arg| arg == "--check") {
        let current = fs::read_to_string(&path).unwrap_or_default();
        if current != spec {
            eprintln!("🚨  openapi.json is out of date, run s/openapi to update it");
            return ExitCode::FAILURE;
        }
        return ExitCode::SUCCESS;
    }

    fs::write(&path, spec).expect("write openapi.json");
    ExitCode::SUCCESS
}
