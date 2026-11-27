//! nginx sends the endpoints in `infra/nginx/recipeyak.conf`'s `$api_upstream`
//! map here and everything else to Django, so every route in the OpenAPI
//! schema needs an entry, and every entry needs a route.

use std::path::Path;

use regex::Regex;

const UPSTREAM: &str = "recipeyak_rs";

/// A `"<method> <uri>"` key from the map, either exact or a `~` regex.
enum Key {
    Exact(String),
    Regex(Regex),
}

impl Key {
    fn matches(&self, request: &str) -> bool {
        match self {
            Key::Exact(key) => key == request,
            Key::Regex(re) => re.is_match(request),
        }
    }
}

fn nginx_keys() -> Vec<(String, Key)> {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../infra/nginx/recipeyak.conf");
    let conf = std::fs::read_to_string(path).unwrap();
    let map = conf
        .split_once("map \"$request_method $uri\" $api_upstream {")
        .and_then(|(_, rest)| rest.split_once('}'))
        .expect("$api_upstream map not found")
        .0;
    let entry = Regex::new(r#"^\s*"([^"]+)"\s+(\S+);"#).unwrap();
    map.lines()
        .filter_map(|line| entry.captures(line))
        .filter(|captures| &captures[2] == UPSTREAM)
        .map(|captures| {
            let raw = captures[1].to_string();
            let key = match raw.strip_prefix('~') {
                Some(re) => Key::Regex(Regex::new(re).unwrap()),
                None => Key::Exact(raw.clone()),
            };
            (raw, key)
        })
        .collect()
}

/// `"<METHOD> <path>"` for each operation, with path params filled in.
fn schema_requests() -> Vec<String> {
    let param = Regex::new(r"\{[^}]+\}").unwrap();
    let api = serde_json::to_value(recipeyak::openapi()).unwrap();
    let mut requests = Vec::new();
    for (path, item) in api["paths"].as_object().unwrap() {
        for method in item.as_object().unwrap().keys() {
            let uri = param.replace_all(path, "123");
            requests.push(format!("{} {uri}", method.to_uppercase()));
        }
    }
    requests
}

#[test]
fn nginx_routes_every_endpoint_here() {
    let keys = nginx_keys();
    let missing: Vec<_> = schema_requests()
        .into_iter()
        .filter(|request| !keys.iter().any(|(_, key)| key.matches(request)))
        .collect();
    assert!(
        missing.is_empty(),
        "add these to $api_upstream in infra/nginx/recipeyak.conf: {missing:#?}"
    );
}

#[test]
fn nginx_routes_nothing_else_here() {
    let requests = schema_requests();
    let stale: Vec<_> = nginx_keys()
        .into_iter()
        .filter(|(_, key)| !requests.iter().any(|request| key.matches(request)))
        .map(|(raw, _)| raw)
        .collect();
    assert!(
        stale.is_empty(),
        "these $api_upstream entries in infra/nginx/recipeyak.conf have no route: {stale:#?}"
    );
}
