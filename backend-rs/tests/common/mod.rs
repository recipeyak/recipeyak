//! Helpers for integration tests.
//!
//! Tests run against `DATABASE_URL`, which must have the Django migrations
//! applied. Each test creates its own users and teams so tests can run in
//! parallel without cleaning up.

// Each test binary includes this module but only uses some of the helpers.
#![allow(dead_code)]

use std::sync::Arc;

use axum::Router;
use axum::body::Body;
use axum::http::{Request, Response, header};
use chrono::{DateTime, Duration, Utc};
use http_body_util::BodyExt;
use recipeyak::config::Config;
use recipeyak::django::session::{self, MODEL_BACKEND, SESSION_COOKIE_NAME, SessionData};
use recipeyak::{AppState, app};
use serde_json::Value;
use sqlx::PgPool;
use tower::ServiceExt;
use uuid::Uuid;

pub const SECRET_KEY: &str = "test-secret-key";
pub const STORAGE_HOSTNAME: &str = "images.example.com";

pub struct TestApp {
    pub pool: PgPool,
    router: Router,
}

impl TestApp {
    pub async fn new() -> Self {
        let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let pool = PgPool::connect(&database_url)
            .await
            .expect("connect to database");
        let config = Config {
            database_url,
            secret_key: SECRET_KEY.to_owned(),
            storage_url: format!("https://{STORAGE_HOSTNAME}").parse().unwrap(),
            bind_addr: "127.0.0.1:0".parse().unwrap(),
        };
        let router = app(AppState {
            pool: pool.clone(),
            config: Arc::new(config),
        });
        Self { pool, router }
    }

    pub async fn get(&self, path: &str, session_key: Option<&str>) -> (Response<Body>, Value) {
        let mut request = Request::get(path);
        if let Some(key) = session_key {
            request = request.header(header::COOKIE, format!("{SESSION_COOKIE_NAME}={key}"));
        }
        let response = self
            .router
            .clone()
            .oneshot(request.body(Body::empty()).unwrap())
            .await
            .unwrap();
        let (parts, body) = response.into_parts();
        let bytes = body.collect().await.unwrap().to_bytes();
        let json = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
        (Response::from_parts(parts, Body::empty()), json)
    }

    pub async fn create_team(&self) -> i32 {
        sqlx::query_scalar(
            "INSERT INTO core_team (created, modified, name) VALUES (now(), now(), $1) RETURNING id",
        )
        .bind(format!("team-{}", Uuid::new_v4()))
        .fetch_one(&self.pool)
        .await
        .unwrap()
    }

    /// Creates a user who is an active member of `team_id` with it selected.
    pub async fn create_user(&self, team_id: i32) -> User {
        let password = format!("pbkdf2_sha256$1$salt${}", Uuid::new_v4());
        let id: i32 = sqlx::query_scalar(
            r#"
            INSERT INTO core_myuser
                (password, email, created, last_updated, theme, theme_night, theme_mode, schedule_team_id)
            VALUES ($1, $2, now(), now(), 'light', 'dark', 'single', $3)
            RETURNING id
            "#,
        )
        .bind(&password)
        .bind(format!("{}@example.com", Uuid::new_v4()))
        .bind(team_id)
        .fetch_one(&self.pool)
        .await
        .unwrap();
        self.add_membership(id, team_id, true).await;
        User { id, password }
    }

    pub async fn add_membership(&self, user_id: i32, team_id: i32, is_active: bool) {
        sqlx::query(
            r#"
            INSERT INTO core_membership
                (created, modified, level, calendar_sync_enabled, calendar_secret_key, is_active, team_id, user_id)
            VALUES (now(), now(), 'admin', false, $1, $2, $3, $4)
            "#,
        )
        .bind(Uuid::new_v4().to_string())
        .bind(is_active)
        .bind(team_id)
        .bind(user_id)
        .execute(&self.pool)
        .await
        .unwrap();
    }

    /// Creates a session the same way Django's `login()` would.
    pub async fn login(&self, user: &User) -> String {
        let data = SessionData {
            user_id: user.id.to_string(),
            backend: MODEL_BACKEND.to_owned(),
            hash: session::session_auth_hash(&user.password, SECRET_KEY),
        };
        let session_data = session::encode(&data, SECRET_KEY).unwrap();
        self.create_session(user.id, &session_data, Utc::now() + Duration::days(1))
            .await
    }

    pub async fn create_session(
        &self,
        user_id: i32,
        session_data: &str,
        expire_date: DateTime<Utc>,
    ) -> String {
        let session_key = Uuid::new_v4().simple().to_string();
        sqlx::query(
            r#"
            INSERT INTO user_sessions_session
                (session_key, session_data, expire_date, last_activity, user_id)
            VALUES ($1, $2, $3, now(), $4)
            "#,
        )
        .bind(&session_key)
        .bind(session_data)
        .bind(expire_date)
        .bind(user_id)
        .execute(&self.pool)
        .await
        .unwrap();
        session_key
    }

    pub async fn create_recipe(&self, team_id: i32, name: &str) -> i32 {
        sqlx::query_scalar(
            r#"
            INSERT INTO core_recipe (created, modified, name, author, team_id)
            VALUES (now(), now(), $1, 'Julia Child', $2)
            RETURNING id
            "#,
        )
        .bind(name)
        .bind(team_id)
        .fetch_one(&self.pool)
        .await
        .unwrap()
    }

    pub async fn set_primary_image(
        &self,
        recipe_id: i32,
        key: &str,
        background_url: Option<&str>,
    ) -> i32 {
        let upload_id: i32 = sqlx::query_scalar(
            r#"
            INSERT INTO core_upload
                (created, modified, bucket, key, content_type, completed, background_url, recipe_id)
            VALUES (now(), now(), 'bucket', $1, 'image/jpeg', true, $2, $3)
            RETURNING id
            "#,
        )
        .bind(key)
        .bind(background_url)
        .bind(recipe_id)
        .fetch_one(&self.pool)
        .await
        .unwrap();
        sqlx::query("UPDATE core_recipe SET primary_image_id = $1 WHERE id = $2")
            .bind(upload_id)
            .bind(recipe_id)
            .execute(&self.pool)
            .await
            .unwrap();
        upload_id
    }

    pub async fn view_recipe(&self, user_id: i32, recipe_id: i32, last_visited_at: DateTime<Utc>) {
        sqlx::query(
            r#"
            INSERT INTO recipe_view (created, modified, last_visited_at, count, recipe_id, user_id)
            VALUES (now(), now(), $1, 1, $2, $3)
            "#,
        )
        .bind(last_visited_at)
        .bind(recipe_id)
        .bind(user_id)
        .execute(&self.pool)
        .await
        .unwrap();
    }
}

pub struct User {
    pub id: i32,
    pub password: String,
}
