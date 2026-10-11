//! The parts of `django.core.signing` and `django.utils.crypto` that sessions use.

use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use flate2::read::ZlibDecoder;
use hmac::{Hmac, Mac};
use serde::de::DeserializeOwned;
use sha2::{Digest, Sha256};
use std::io::Read;
use subtle::ConstantTimeEq;

/// `django.utils.crypto.salted_hmac` with sha256.
pub fn salted_hmac(key_salt: &str, value: &[u8], secret: &str) -> Hmac<Sha256> {
    let key = Sha256::new()
        .chain_update(key_salt)
        .chain_update(secret)
        .finalize();
    let mut mac = Hmac::<Sha256>::new_from_slice(&key).expect("hmac accepts any key length");
    mac.update(value);
    mac
}

/// `django.core.signing.loads(s, key=secret, salt=salt)` without a `max_age`.
///
/// Format: `[.]<b64 payload>:<b62 timestamp>:<b64 signature>` where the
/// signature covers everything before the last `:` and a leading `.` means
/// the payload is zlib compressed.
pub fn loads<T: DeserializeOwned>(secret: &str, salt: &str, s: &str) -> Option<T> {
    let (value, signature) = s.rsplit_once(':')?;
    let expected = salted_hmac(&format!("{salt}signer"), value.as_bytes(), secret)
        .finalize()
        .into_bytes();
    let expected = URL_SAFE_NO_PAD.encode(expected);
    if !bool::from(signature.as_bytes().ct_eq(expected.as_bytes())) {
        return None;
    }
    // without a max_age the timestamp is unused
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
