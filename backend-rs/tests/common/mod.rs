//! Shared setup for integration tests.
//!
//! Tests use `#[sqlx::test(migrations = "tests/schema")]`, which creates a
//! fresh database per test from `DATABASE_URL` and loads the schema generated
//! by `s/generate-test-schema`.

#![allow(dead_code)]

use std::sync::Arc;

use axum::Router;
use axum::body::{Body, to_bytes};
use axum::http::{Request, StatusCode, header};
use chrono::NaiveDate;
use recipeyak::AppState;
use recipeyak::config::Config;
use serde_json::{Value, json};
use sqlx::PgPool;
use tower::ServiceExt;

pub const SECRET_KEY: &str = "test-secret-key";
const PASSWORD: &str = "pbkdf2_sha256$1$salt$hash";

pub struct TestApp {
    router: Router,
}

pub struct TestResponse {
    pub status: StatusCode,
    pub body: Vec<u8>,
}

impl TestResponse {
    pub fn json(&self) -> Value {
        serde_json::from_slice(&self.body).unwrap_or_else(|err| {
            panic!(
                "response is not JSON ({err}): {}",
                String::from_utf8_lossy(&self.body)
            )
        })
    }
}

impl TestApp {
    pub fn new(pool: PgPool) -> Self {
        let config = Config {
            debug: true,
            secret_key: SECRET_KEY.into(),
            database_url: String::new(),
            storage_url: "https://images.test".parse().unwrap(),
            port: 0,
        };
        let state = AppState {
            pool,
            config: Arc::new(config),
        };
        Self {
            router: recipeyak::app(state),
        }
    }

    pub async fn get(&self, uri: &str, session_key: Option<&str>) -> TestResponse {
        let mut request = Request::get(uri);
        if let Some(key) = session_key {
            request = request.header(
                header::COOKIE,
                format!("{}={key}", django_session::SESSION_COOKIE_NAME),
            );
        }
        let response = self
            .router
            .clone()
            .oneshot(request.body(Body::empty()).unwrap())
            .await
            .unwrap();
        let status = response.status();
        let body = to_bytes(response.into_body(), usize::MAX)
            .await
            .unwrap()
            .to_vec();
        TestResponse { status, body }
    }
}

pub async fn create_user(pool: &PgPool, email: &str) -> i32 {
    sqlx::query_scalar(
        "INSERT INTO core_myuser (password, email, created, last_updated, theme, theme_night, theme_mode)
         VALUES ($1, $2, now(), now(), 'light', 'dark', 'single') RETURNING id",
    )
    .bind(PASSWORD)
    .bind(email)
    .fetch_one(pool)
    .await
    .unwrap()
}

pub async fn create_team(pool: &PgPool, name: &str) -> i32 {
    sqlx::query_scalar(
        "INSERT INTO core_team (name, created, modified) VALUES ($1, now(), now()) RETURNING id",
    )
    .bind(name)
    .fetch_one(pool)
    .await
    .unwrap()
}

pub async fn add_member(pool: &PgPool, team_id: i32, user_id: i32) {
    sqlx::query(
        "INSERT INTO core_membership (team_id, user_id, level, is_active, calendar_sync_enabled, calendar_secret_key, created, modified)
         VALUES ($1, $2, 'admin', true, false, 'secret', now(), now())",
    )
    .bind(team_id)
    .bind(user_id)
    .execute(pool)
    .await
    .unwrap();
}

pub async fn create_calendar(pool: &PgPool, team_id: i32, name: &str) -> i32 {
    sqlx::query_scalar(
        "INSERT INTO core_calendar (team_id, name, created, modified) VALUES ($1, $2, now(), now()) RETURNING id",
    )
    .bind(team_id)
    .bind(name)
    .fetch_one(pool)
    .await
    .unwrap()
}

/// Set the user's selected team and pinned calendar.
pub async fn select_calendar(pool: &PgPool, user_id: i32, team_id: i32, calendar_id: i32) {
    sqlx::query(
        "UPDATE core_myuser SET schedule_team_id = $2, pinned_calendar_id = $3 WHERE id = $1",
    )
    .bind(user_id)
    .bind(team_id)
    .bind(calendar_id)
    .execute(pool)
    .await
    .unwrap();
}

/// A user who is a member of a team, with one of its calendars pinned.
pub struct Account {
    pub user_id: i32,
    pub team_id: i32,
    pub calendar_id: i32,
}

pub async fn create_account(pool: &PgPool, email: &str) -> Account {
    let user_id = create_user(pool, email).await;
    let team_id = create_team(pool, "Household").await;
    add_member(pool, team_id, user_id).await;
    let calendar_id = create_calendar(pool, team_id, "Dinners").await;
    select_calendar(pool, user_id, team_id, calendar_id).await;
    Account {
        user_id,
        team_id,
        calendar_id,
    }
}

pub async fn create_recipe(pool: &PgPool, team_id: i32, name: &str) -> i32 {
    sqlx::query_scalar(
        "INSERT INTO core_recipe (team_id, name, created, modified) VALUES ($1, $2, now(), now()) RETURNING id",
    )
    .bind(team_id)
    .bind(name)
    .fetch_one(pool)
    .await
    .unwrap()
}

pub async fn schedule_recipe(
    pool: &PgPool,
    account: &Account,
    recipe_id: i32,
    on: NaiveDate,
) -> i32 {
    sqlx::query_scalar(
        "INSERT INTO core_scheduledrecipe (recipe_id, team_id, calendar_id, created_by_id, \"on\", created, modified)
         VALUES ($1, $2, $3, $4, $5, now(), now()) RETURNING id",
    )
    .bind(recipe_id)
    .bind(account.team_id)
    .bind(account.calendar_id)
    .bind(account.user_id)
    .bind(on)
    .fetch_one(pool)
    .await
    .unwrap()
}

/// Store a session the way `django.contrib.auth.login()` would and return
/// its key for the cookie.
pub async fn login(pool: &PgPool, user_id: i32) -> String {
    let password: String = sqlx::query_scalar("SELECT password FROM core_myuser WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await
        .unwrap();
    let Value::Object(session) = json!({
        "_auth_user_id": user_id.to_string(),
        "_auth_user_backend": django_session::MODEL_BACKEND,
        "_auth_user_hash": django_session::session_auth_hash(SECRET_KEY, &password),
    }) else {
        unreachable!()
    };
    let session_key = format!("testsession{user_id:021}");
    sqlx::query(
        "INSERT INTO user_sessions_session (session_key, session_data, expire_date, last_activity, user_id)
         VALUES ($1, $2, now() + interval '1 day', now(), $3)",
    )
    .bind(&session_key)
    .bind(django_session::encode(SECRET_KEY, &session))
    .bind(user_id)
    .execute(pool)
    .await
    .unwrap();
    session_key
}

pub async fn set_primary_image(pool: &PgPool, recipe_id: i32, key: &str) -> i32 {
    let upload_id: i32 = sqlx::query_scalar(
        "INSERT INTO core_upload (bucket, key, content_type, completed, recipe_id, created, modified)
         VALUES ('test-bucket', $1, 'image/jpeg', true, $2, now(), now()) RETURNING id",
    )
    .bind(key)
    .bind(recipe_id)
    .fetch_one(pool)
    .await
    .unwrap();
    sqlx::query("UPDATE core_recipe SET primary_image_id = $2 WHERE id = $1")
        .bind(recipe_id)
        .bind(upload_id)
        .execute(pool)
        .await
        .unwrap();
    upload_id
}
