//! Read and write Django database-backed sessions and the auth data
//! `django.contrib.auth.login()` stores in them.
//!
//! Loading the session row and the user is left to the caller; this crate
//! only handles Django's formats.

mod signing;

use hmac::Mac;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use subtle::ConstantTimeEq;

pub const SESSION_COOKIE_NAME: &str = "sessionid";
pub const MODEL_BACKEND: &str = "django.contrib.auth.backends.ModelBackend";

const SESSION_SALT: &str = "django.contrib.sessions.SessionStore";
const AUTH_HASH_SALT: &str = "django.contrib.auth.models.AbstractBaseUser.get_session_auth_hash";

/// `SessionBase._validate_session_key`
pub fn is_valid_session_key(key: &str) -> bool {
    key.len() >= 8
}

/// `SessionStore.decode`: the full session dict.
pub fn decode(secret: &str, session_data: &str) -> Option<Map<String, Value>> {
    signing::loads(secret, SESSION_SALT, session_data)
}

/// `SessionStore.encode`
pub fn encode(secret: &str, session: &Map<String, Value>) -> String {
    signing::dumps(secret, SESSION_SALT, session)
}

/// The `_auth_user_*` keys `django.contrib.auth.login()` writes.
#[derive(Debug, Deserialize, Serialize)]
pub struct AuthSession {
    #[serde(rename = "_auth_user_id")]
    pub user_id: String,
    #[serde(rename = "_auth_user_backend")]
    pub backend: String,
    #[serde(rename = "_auth_user_hash")]
    pub hash: String,
}

/// Decode the session and return its auth data, or `None` if the session is
/// invalid or anonymous.
pub fn auth_session(secret: &str, session_data: &str) -> Option<AuthSession> {
    signing::loads(secret, SESSION_SALT, session_data)
}

/// `AbstractBaseUser.get_session_auth_hash`
pub fn session_auth_hash(secret: &str, password: &str) -> String {
    let digest = signing::salted_hmac(AUTH_HASH_SALT, password.as_bytes(), secret)
        .finalize()
        .into_bytes();
    digest.iter().map(|b| format!("{b:02x}")).collect()
}

/// Check a session's stored auth hash against the user's current password
/// hash, so sessions are invalidated on password change.
pub fn verify_session_auth_hash(secret: &str, password: &str, hash: &str) -> bool {
    let expected = session_auth_hash(secret, password);
    bool::from(hash.as_bytes().ct_eq(expected.as_bytes()))
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
        let auth = auth_session(SECRET, SESSION_DATA.trim()).expect("valid session");
        assert_eq!(auth.user_id, "1");
        assert_eq!(auth.backend, MODEL_BACKEND);
        assert_eq!(auth.hash, "abc");
    }

    #[test]
    fn decodes_encoded_session() {
        let session = serde_json::json!({
            "_auth_user_id": "42",
            "_auth_user_backend": MODEL_BACKEND,
            "_auth_user_hash": "def",
        });
        let session = session.as_object().unwrap();
        let decoded = auth_session(SECRET, &encode(SECRET, session)).expect("valid session");
        assert_eq!(decoded.user_id, "42");
        assert_eq!(decoded.backend, MODEL_BACKEND);
        assert_eq!(decoded.hash, "def");
    }

    #[test]
    fn rejects_session_signed_with_another_key() {
        assert!(decode("other-secret", SESSION_DATA.trim()).is_none());
    }

    #[test]
    fn rejects_tampered_session() {
        let tampered = format!("x{}", SESSION_DATA.trim());
        assert!(decode(SECRET, &tampered).is_none());
    }

    #[test]
    fn matches_django_session_auth_hash() {
        assert_eq!(
            session_auth_hash(SECRET, "pbkdf2_sha256$1$salt$hash"),
            AUTH_HASH.trim()
        );
    }
}
