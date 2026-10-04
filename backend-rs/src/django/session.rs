//! Reading sessions created by Django's auth framework, stored via the
//! `user_sessions` package.
//!
//! See `django.contrib.auth.get_user` for the logic this mirrors.

use hmac::Mac;
use serde::{Deserialize, Serialize};

use super::signing::{self, SigningError};

/// Django's default `SESSION_COOKIE_NAME`.
pub const SESSION_COOKIE_NAME: &str = "sessionid";

/// `SessionBase.key_salt` for `user_sessions.backends.db.SessionStore`.
pub const SESSION_SALT: &str = "django.contrib.sessions.SessionStore";

/// We use Django's default `AUTHENTICATION_BACKENDS`.
pub const MODEL_BACKEND: &str = "django.contrib.auth.backends.ModelBackend";

const SESSION_AUTH_HASH_SALT: &str =
    "django.contrib.auth.models.AbstractBaseUser.get_session_auth_hash";

/// The auth related keys Django stores in the session.
#[derive(Debug, Serialize, Deserialize)]
pub struct SessionData {
    #[serde(rename = "_auth_user_id")]
    pub user_id: String,
    #[serde(rename = "_auth_user_backend")]
    pub backend: String,
    #[serde(rename = "_auth_user_hash")]
    pub hash: String,
}

pub fn decode(session_data: &str, secret: &str) -> Result<SessionData, SigningError> {
    signing::loads(session_data, secret, SESSION_SALT)
}

pub fn encode(data: &SessionData, secret: &str) -> Result<String, SigningError> {
    signing::dumps(data, secret, SESSION_SALT)
}

/// Port of `AbstractBaseUser.get_session_auth_hash`.
///
/// Changing a user's password invalidates their existing sessions.
pub fn session_auth_hash(password: &str, secret: &str) -> String {
    hex::encode(auth_hash_mac(password, secret).finalize().into_bytes())
}

/// Constant time comparison of the session's auth hash against the user's password.
pub fn verify_session_auth_hash(session_hash: &str, password: &str, secret: &str) -> bool {
    let Ok(expected) = hex::decode(session_hash) else {
        return false;
    };
    auth_hash_mac(password, secret)
        .verify_slice(&expected)
        .is_ok()
}

fn auth_hash_mac(password: &str, secret: &str) -> hmac::Hmac<sha2::Sha256> {
    signing::salted_hmac(SESSION_AUTH_HASH_SALT, password.as_bytes(), secret)
}

#[cfg(test)]
mod tests {
    use super::*;

    const SECRET: &str = "test-secret-key";
    const PASSWORD: &str = "pbkdf2_sha256$1$salt$hash";

    #[test]
    fn session_auth_hash_matches_django() {
        // from `salted_hmac(SESSION_AUTH_HASH_SALT, PASSWORD, SECRET, algorithm="sha256").hexdigest()`
        assert_eq!(
            session_auth_hash(PASSWORD, SECRET),
            "b3db42b24de3326b795defc8a1f10b8855c6f542c394ad14f8b0a554d99e3699"
        );
    }

    #[test]
    fn verify_session_auth_hash_checks_password() {
        let hash = session_auth_hash(PASSWORD, SECRET);
        assert!(verify_session_auth_hash(&hash, PASSWORD, SECRET));
        assert!(!verify_session_auth_hash(&hash, "new-password", SECRET));
        assert!(!verify_session_auth_hash("not-hex", PASSWORD, SECRET));
    }
}
