//! Checks that every endpoint in our OpenAPI spec matches the Django API's
//! spec (`backend/api-schema.json`), which the frontend's API client is
//! generated from.
//!
//! The specs are written differently (utoipa uses `$ref`s and
//! `type: [T, "null"]`, Django inlines everything and uses `anyOf`), so both
//! are normalized before comparing.

use std::path::Path;

use serde_json::{Map, Value, json};

const HTTP_METHODS: &[&str] = &[
    "get", "put", "post", "delete", "options", "head", "patch", "trace",
];

#[test]
fn endpoints_match_django_spec() {
    let rust = serde_json::to_value(recipeyak::openapi()).unwrap();
    let django = django_spec();
    let rust_components = &rust["components"]["schemas"];
    let django_components = &django["components"]["schemas"];

    let paths = rust["paths"].as_object().unwrap();
    assert!(!paths.is_empty());
    for (path, item) in paths {
        for (method, op) in item.as_object().unwrap() {
            if !HTTP_METHODS.contains(&method.as_str()) {
                continue;
            }
            let context = format!("{} {path}", method.to_uppercase());
            let django_op = &django["paths"][path][method];
            assert!(
                django_op.is_object(),
                "{context} isn't in backend/api-schema.json, new endpoints should be added to Django first"
            );

            assert_eq!(
                op["operationId"], django_op["operationId"],
                "{context}: operationId"
            );
            assert_eq!(
                parameters(op, rust_components),
                parameters(django_op, django_components),
                "{context}: parameters"
            );
            assert_eq!(
                request_body(op, rust_components),
                request_body(django_op, django_components),
                "{context}: requestBody"
            );
            let django_responses = django_op["responses"].as_object().unwrap();
            for (status, django_response) in django_responses {
                assert_eq!(
                    response(&op["responses"][status], rust_components),
                    response(django_response, django_components),
                    "{context}: {status} response"
                );
            }
        }
    }
}

fn django_spec() -> Value {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../backend/api-schema.json");
    let contents =
        std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("read {}: {e}", path.display()));
    serde_json::from_str(&contents).unwrap()
}

fn parameters(op: &Value, components: &Value) -> Vec<Value> {
    let mut params: Vec<Value> = op["parameters"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|p| {
            json!({
                "name": p["name"],
                "in": p["in"],
                "required": p["required"].as_bool().unwrap_or(false),
                "schema": normalize(&p["schema"], components),
            })
        })
        .collect();
    params.sort_by_key(|p| (p["in"].to_string(), p["name"].to_string()));
    params
}

fn request_body(op: &Value, components: &Value) -> Value {
    let body = &op["requestBody"];
    if body.is_null() {
        return Value::Null;
    }
    json!({
        "required": body["required"].as_bool().unwrap_or(false),
        "schema": normalize(&body["content"]["application/json"]["schema"], components),
    })
}

fn response(response: &Value, components: &Value) -> Value {
    normalize(
        &response["content"]["application/json"]["schema"],
        components,
    )
}

/// Converts a schema into a canonical form, so equivalent schemas are equal.
fn normalize(schema: &Value, components: &Value) -> Value {
    let map = match schema {
        Value::Object(map) => map,
        Value::Array(items) => {
            return Value::Array(items.iter().map(|v| normalize(v, components)).collect());
        }
        other => return other.clone(),
    };

    if let Some(reference) = map.get("$ref").and_then(Value::as_str) {
        let name = reference
            .strip_prefix("#/components/schemas/")
            .unwrap_or_else(|| panic!("unsupported $ref: {reference}"));
        return normalize(&components[name], components);
    }

    let mut out = Map::new();
    for (key, value) in map {
        match key.as_str() {
            // documentation only
            "description" | "title" | "example" | "examples" => {}
            // Django doesn't specify integer sizes
            "format" if matches!(value.as_str(), Some("int32" | "int64")) => {}
            "required" => {
                let mut required = value.as_array().cloned().unwrap_or_default();
                required.sort_by_key(Value::to_string);
                if !required.is_empty() {
                    out.insert(key.clone(), Value::Array(required));
                }
            }
            "properties" => {
                let properties = value
                    .as_object()
                    .unwrap()
                    .iter()
                    .map(|(name, prop)| (name.clone(), normalize(prop, components)))
                    .collect();
                out.insert(key.clone(), Value::Object(properties));
            }
            "oneOf" | "anyOf" => {
                out.insert("anyOf".to_owned(), normalize(value, components));
            }
            _ => {
                out.insert(key.clone(), normalize(value, components));
            }
        }
    }

    // `type: [T, "null"]` -> `anyOf: [{type: T}, {type: "null"}]`
    if let Some(Value::Array(types)) = out.get("type").cloned()
        && types.len() == 2
        && types.contains(&json!("null"))
    {
        let inner = types.into_iter().find(|t| t != "null").unwrap();
        let mut non_null = out.clone();
        non_null.insert("type".to_owned(), inner);
        out = Map::from_iter([(
            "anyOf".to_owned(),
            json!([Value::Object(non_null), {"type": "null"}]),
        )]);
    }

    if let Some(Value::Array(variants)) = out.get_mut("anyOf") {
        variants.sort_by_key(Value::to_string);
    }

    Value::Object(out)
}

#[test]
fn normalize_treats_nullable_forms_as_equal() {
    let components = json!({"Image": {"type": "object", "properties": {"id": {"type": "integer", "format": "int32"}}}});
    let utoipa = json!({
        "type": "object",
        "required": ["b", "a"],
        "properties": {
            "a": {"type": ["string", "null"], "format": "date-time"},
            "b": {"oneOf": [{"$ref": "#/components/schemas/Image"}, {"type": "null"}]},
        },
    });
    let django = json!({
        "type": "object",
        "required": ["a", "b"],
        "properties": {
            "a": {"anyOf": [{"format": "date-time", "type": "string"}, {"type": "null"}]},
            "b": {"anyOf": [{"type": "null"}, {"type": "object", "properties": {"id": {"type": "integer"}}}]},
        },
    });
    assert_eq!(
        normalize(&utoipa, &components),
        normalize(&django, &Value::Null)
    );
}
