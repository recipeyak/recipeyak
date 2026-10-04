//! A port of the parts of `django.core.signing` and `django.utils.crypto` we
//! need to read sessions created by the Django backend.
//!
//! Only SHA-256 is supported, which is the default for Django's `Signer`.

use std::io::Read;
use std::time::{SystemTime, UNIX_EPOCH};

use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use flate2::Compression;
use flate2::read::ZlibDecoder;
use flate2::write::ZlibEncoder;
use hmac::{Hmac, KeyInit, Mac};
use serde::Serialize;
use serde::de::DeserializeOwned;
use sha2::{Digest, Sha256};

const SEP: char = ':';

#[derive(Debug, thiserror::Error)]
pub enum SigningError {
    #[error("bad signature")]
    BadSignature,
    #[error("malformed payload")]
    Malformed,
    #[error(transparent)]
    Json(#[from] serde_json::Error),
}

/// Port of `django.utils.crypto.salted_hmac` using SHA-256.
pub fn salted_hmac(key_salt: &str, value: &[u8], secret: &str) -> Hmac<Sha256> {
    let key = Sha256::new()
        .chain_update(key_salt)
        .chain_update(secret)
        .finalize();
    let mut mac = Hmac::<Sha256>::new_from_slice(&key).expect("HMAC accepts keys of any size");
    mac.update(value);
    mac
}

/// Port of `django.core.signing.loads`.
///
/// Like Django's session store we don't enforce a `max_age`, session expiry
/// is tracked in the database instead.
pub fn loads<T: DeserializeOwned>(
    signed: &str,
    secret: &str,
    salt: &str,
) -> Result<T, SigningError> {
    let (value, signature) = signed.rsplit_once(SEP).ok_or(SigningError::BadSignature)?;
    let signature = URL_SAFE_NO_PAD
        .decode(signature)
        .map_err(|_| SigningError::BadSignature)?;
    salted_hmac(&signer_salt(salt), value.as_bytes(), secret)
        .verify_slice(&signature)
        .map_err(|_| SigningError::BadSignature)?;

    // TimestampSigner appends the timestamp before signing.
    let (payload, _timestamp) = value.rsplit_once(SEP).ok_or(SigningError::Malformed)?;
    let (is_compressed, payload) = match payload.strip_prefix('.') {
        Some(rest) => (true, rest),
        None => (false, payload),
    };
    let mut data = URL_SAFE_NO_PAD
        .decode(payload)
        .map_err(|_| SigningError::Malformed)?;
    if is_compressed {
        let mut decompressed = Vec::new();
        ZlibDecoder::new(data.as_slice())
            .read_to_end(&mut decompressed)
            .map_err(|_| SigningError::Malformed)?;
        data = decompressed;
    }
    Ok(serde_json::from_slice(&data)?)
}

/// Port of `django.core.signing.dumps` with `compress=True`.
pub fn dumps<T: Serialize>(value: &T, secret: &str, salt: &str) -> Result<String, SigningError> {
    let data = serde_json::to_vec(value)?;
    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
    std::io::Write::write_all(&mut encoder, &data).map_err(|_| SigningError::Malformed)?;
    let compressed = encoder.finish().map_err(|_| SigningError::Malformed)?;
    let payload = if compressed.len() < data.len() - 1 {
        format!(".{}", URL_SAFE_NO_PAD.encode(compressed))
    } else {
        URL_SAFE_NO_PAD.encode(data)
    };

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock is after the unix epoch")
        .as_secs();
    let value = format!("{payload}{SEP}{}", b62_encode(timestamp));
    let signature = salted_hmac(&signer_salt(salt), value.as_bytes(), secret)
        .finalize()
        .into_bytes();
    Ok(format!("{value}{SEP}{}", URL_SAFE_NO_PAD.encode(signature)))
}

fn signer_salt(salt: &str) -> String {
    format!("{salt}signer")
}

fn b62_encode(mut n: u64) -> String {
    const ALPHABET: &[u8] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if n == 0 {
        return "0".to_owned();
    }
    let mut out = Vec::new();
    while n > 0 {
        out.push(ALPHABET[(n % 62) as usize]);
        n /= 62;
    }
    out.reverse();
    String::from_utf8(out).expect("alphabet is ascii")
}

#[cfg(test)]
mod tests {
    use serde_json::{Value, json};

    use super::*;

    const SECRET: &str = "test-secret-key";
    const SALT: &str = "django.contrib.sessions.SessionStore";

    // Generated with Django via:
    // signing.dumps({"_auth_user_id": "7"}, key=SECRET, salt=SALT, serializer=JSONSerializer)
    const UNCOMPRESSED: &str =
        "eyJfYXV0aF91c2VyX2lkIjoiNyJ9:1xDC2Q:sgV8PbaUlemUe7vww34hQsDqPoUwStM0kWuu6p307eY";

    // Generated with Django via `SessionStore().encode(...)`
    const COMPRESSED: &str = ".eJxVjEEOwiAQRe_C2pACA4JL9z0DmWFAqoYmpV0Z765NutDtf-_9l4i4rTVuPS9xYnERoMXpdyRMj9x2wndst1mmua3LRHJX5EG7HGfOz-vh_h1U7PVbk2ECTRo4G6MdnYPlXJJHVdRA3lubXLGgkwmArKB4GtBa4BCycSGI9wcWnTgU:1xDC2L:OyZT5GbWXIo4YuwahF6jA48xxJEfEiUkL4CmGxOFYkU";

    #[test]
    fn loads_uncompressed() {
        let value: Value = loads(UNCOMPRESSED, SECRET, SALT).unwrap();
        assert_eq!(value, json!({"_auth_user_id": "7"}));
    }

    #[test]
    fn loads_compressed() {
        let value: Value = loads(COMPRESSED, SECRET, SALT).unwrap();
        assert_eq!(
            value,
            json!({
                "_auth_user_id": "42",
                "_auth_user_backend": "django.contrib.auth.backends.ModelBackend",
                "_auth_user_hash": "b3db42b24de3326b795defc8a1f10b8855c6f542c394ad14f8b0a554d99e3699",
            })
        );
    }

    #[test]
    fn loads_rejects_wrong_secret() {
        let res = loads::<Value>(UNCOMPRESSED, "wrong-secret", SALT);
        assert!(matches!(res, Err(SigningError::BadSignature)));
    }

    #[test]
    fn loads_rejects_wrong_salt() {
        let res = loads::<Value>(UNCOMPRESSED, SECRET, "wrong-salt");
        assert!(matches!(res, Err(SigningError::BadSignature)));
    }

    #[test]
    fn loads_rejects_tampered_payload() {
        let tampered = UNCOMPRESSED.replacen("eyJ", "eyK", 1);
        let res = loads::<Value>(&tampered, SECRET, SALT);
        assert!(matches!(res, Err(SigningError::BadSignature)));
    }

    #[test]
    fn dumps_round_trips() {
        let value = json!({"_auth_user_id": "1", "padding": "x".repeat(200)});
        let signed = dumps(&value, SECRET, SALT).unwrap();
        assert!(
            signed.starts_with('.'),
            "large payloads should be compressed"
        );
        assert_eq!(loads::<Value>(&signed, SECRET, SALT).unwrap(), value);
    }

    #[test]
    fn b62_encode_matches_django() {
        assert_eq!(b62_encode(0), "0");
        assert_eq!(b62_encode(61), "z");
        assert_eq!(b62_encode(62), "10");
    }
}
