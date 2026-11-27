//! `api-schema.json` is what the UI's API client is generated from, and what
//! the dev server and nginx route on, so it has to match the registered routes.

use std::path::Path;

#[test]
fn api_schema_is_up_to_date() {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("api-schema.json");
    let expected = format!("{}\n", recipeyak::openapi().to_pretty_json().unwrap());
    if std::env::var_os("UPDATE_SCHEMA").is_some() {
        std::fs::write(&path, &expected).unwrap();
        return;
    }
    let actual = std::fs::read_to_string(&path).unwrap_or_default();
    assert!(
        actual == expected,
        "api-schema.json is out of date, regenerate it with `./s/generate-schema`"
    );
}
