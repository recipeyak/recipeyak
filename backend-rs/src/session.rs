//! Authenticate requests using the Django session cookie.
//!
//! Mirrors `user_sessions.backends.db.SessionStore` + `django.contrib.auth.get_user`:
//! load the unexpired session row, verify and decode its signed payload, then
//! check the stored auth hash against the user's current password hash so
//! sessions are invalidated on password change.

use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum::http::{HeaderMap, header};
use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use flate2::read::ZlibDecoder;
use hmac::{Hmac, Mac};
use serde::Deserialize;
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use std::io::Read;
use subtle::ConstantTimeEq;

use crate::AppState;
use crate::error::ApiError;

pub const SESSION_COOKIE_NAME: &str = "sessionid";

const SESSION_SALT: &str = "django.contrib.sessions.SessionStore";
const AUTH_HASH_SALT: &str = "django.contrib.auth.models.AbstractBaseUser.get_session_auth_hash";
const MODEL_BACKEND: &str = "django.contrib.auth.backends.ModelBackend";

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct User {
    pub id: i32,
    pub password: String,
    pub schedule_team_id: Option<i32>,
    pub pinned_calendar_id: Option<i32>,
}

#[derive(Deserialize)]
struct SessionData {
    #[serde(rename = "_auth_user_id")]
    user_id: Option<String>,
    #[serde(rename = "_auth_user_backend")]
    backend: Option<String>,
    #[serde(rename = "_auth_user_hash")]
    hash: Option<String>,
}

/// Extracting a `User` rejects anonymous requests with `not_authenticated`.
/// The result is cached on the request so other extractors can reuse it.
impl FromRequestParts<AppState> for User {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        if let Some(user) = parts.extensions.get::<User>() {
            return Ok(user.clone());
        }
        let session_key = session_cookie(&parts.headers);
        let user = authenticate(
            &state.pool,
            &state.config.secret_key,
            session_key.as_deref(),
        )
        .await?
        .ok_or_else(ApiError::not_authenticated)?;
        parts.extensions.insert(user.clone());
        Ok(user)
    }
}

fn session_cookie(headers: &HeaderMap) -> Option<String> {
    headers
        .get_all(header::COOKIE)
        .iter()
        .filter_map(|v| v.to_str().ok())
        .flat_map(|v| v.split(';'))
        .filter_map(|pair| pair.trim().split_once('='))
        // like Python's SimpleCookie, the last occurrence wins
        .filter(|(name, _)| *name == SESSION_COOKIE_NAME)
        .next_back()
        .map(|(_, value)| value.trim_matches('"').to_string())
}

pub async fn authenticate(
    pool: &PgPool,
    secret_key: &str,
    session_key: Option<&str>,
) -> Result<Option<User>, ApiError> {
    // SessionBase._validate_session_key
    let Some(session_key) = session_key.filter(|k| k.len() >= 8) else {
        return Ok(None);
    };
    let row: Option<(String,)> = sqlx::query_as(
        "SELECT session_data FROM user_sessions_session WHERE session_key = $1 AND expire_date > now()",
    )
    .bind(session_key)
    .fetch_optional(pool)
    .await?;
    let Some((session_data,)) = row else {
        return Ok(None);
    };
    let Some(data) = decode_session(secret_key, &session_data) else {
        return Ok(None);
    };
    if data.backend.as_deref() != Some(MODEL_BACKEND) {
        return Ok(None);
    }
    let Some(user_id) = data.user_id.and_then(|id| id.parse::<i32>().ok()) else {
        return Ok(None);
    };
    let user: Option<User> = sqlx::query_as(
        "SELECT id, password, schedule_team_id, pinned_calendar_id FROM core_myuser WHERE id = $1",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;
    let Some(user) = user else {
        return Ok(None);
    };
    let Some(session_hash) = data.hash.filter(|h| !h.is_empty()) else {
        return Ok(None);
    };
    let expected = session_auth_hash(secret_key, &user.password);
    if !bool::from(session_hash.as_bytes().ct_eq(expected.as_bytes())) {
        return Ok(None);
    }
    Ok(Some(user))
}

/// `django.utils.crypto.salted_hmac` with sha256.
fn salted_hmac(key_salt: &str, value: &[u8], secret: &str) -> Hmac<Sha256> {
    let key = Sha256::new()
        .chain_update(key_salt)
        .chain_update(secret)
        .finalize();
    let mut mac = Hmac::<Sha256>::new_from_slice(&key).expect("hmac accepts any key length");
    mac.update(value);
    mac
}

/// `AbstractBaseUser.get_session_auth_hash`
fn session_auth_hash(secret_key: &str, password: &str) -> String {
    let digest = salted_hmac(AUTH_HASH_SALT, password.as_bytes(), secret_key)
        .finalize()
        .into_bytes();
    digest.iter().map(|b| format!("{b:02x}")).collect()
}

/// `django.core.signing.loads(session_data, salt=SESSION_SALT, compress=True)`
///
/// Format: `[.]<b64 payload>:<b62 timestamp>:<b64 signature>` where the
/// signature covers everything before the last `:` and a leading `.` means
/// the payload is zlib compressed.
fn decode_session(secret_key: &str, session_data: &str) -> Option<SessionData> {
    let (value, signature) = session_data.rsplit_once(':')?;
    let expected = salted_hmac(
        &format!("{SESSION_SALT}signer"),
        value.as_bytes(),
        secret_key,
    )
    .finalize()
    .into_bytes();
    let expected = URL_SAFE_NO_PAD.encode(expected);
    if !bool::from(signature.as_bytes().ct_eq(expected.as_bytes())) {
        return None;
    }
    // sessions are loaded without a max_age, so the timestamp is unused
    let (payload, _timestamp) = value.rsplit_once(':')?;
    let (compressed, payload) = match payload.strip_prefix('.') {
        Some(rest) => (true, rest),
        None => (false, payload),
    };
    let mut bytes = URL_SAFE_NO_PAD.decode(payload).ok()?;
    if compressed {
        let mut out = Vec::new();
        ZlibDecoder::new(bytes.as_slice())
            .read_to_end(&mut out)
            .ok()?;
        bytes = out;
    }
    serde_json::from_slice(&bytes).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    const SECRET: &str = "+p(5+wb+(l2$@iv!1*3=5xnrw2gvi+l$kuo9s7=u6*)ri4v6as";

    // Generated with Django 5.2 and the DEBUG secret key via (zlib compressed):
    //   SessionStore().encode({"_auth_user_id": "1", "_auth_user_backend": "django.contrib.auth.backends.ModelBackend", "_auth_user_hash": "abc"})
    const SESSION_DATA: &str = include_str!("../testdata/session_data.txt");
    // User(password="pbkdf2_sha256$1$salt$hash").get_session_auth_hash()
    const AUTH_HASH: &str = include_str!("../testdata/auth_hash.txt");

    #[test]
    fn decodes_django_signed_session() {
        let data = decode_session(SECRET, SESSION_DATA.trim()).expect("valid session");
        assert_eq!(data.user_id.as_deref(), Some("1"));
        assert_eq!(data.backend.as_deref(), Some(MODEL_BACKEND));
        assert_eq!(data.hash.as_deref(), Some("abc"));
    }

    #[test]
    fn rejects_session_signed_with_another_key() {
        assert!(decode_session("other-secret", SESSION_DATA.trim()).is_none());
    }

    #[test]
    fn rejects_tampered_session() {
        let tampered = format!("x{}", SESSION_DATA.trim());
        assert!(decode_session(SECRET, &tampered).is_none());
    }

    #[test]
    fn matches_django_session_auth_hash() {
        assert_eq!(
            session_auth_hash(SECRET, "pbkdf2_sha256$1$salt$hash"),
            AUTH_HASH.trim()
        );
    }
}
