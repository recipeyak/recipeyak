//! The parts of `django.core.signing` and `django.utils.crypto` that sessions use.

use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use flate2::Compression;
use flate2::read::ZlibDecoder;
use flate2::write::ZlibEncoder;
use hmac::{Hmac, Mac};
use serde::Serialize;
use serde::de::DeserializeOwned;
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use std::time::{SystemTime, UNIX_EPOCH};
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

/// `django.core.signing.dumps(obj, key=secret, salt=salt, compress=True)`
pub fn dumps(secret: &str, salt: &str, obj: &impl Serialize) -> String {
    let data = serde_json::to_vec(obj).expect("serializing to JSON can't fail");
    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
    encoder
        .write_all(&data)
        .expect("writing to a Vec can't fail");
    let compressed = encoder.finish().expect("writing to a Vec can't fail");
    // only use the compressed form when it saves more than the `.` prefix
    let payload = if compressed.len() < data.len() - 1 {
        format!(".{}", URL_SAFE_NO_PAD.encode(compressed))
    } else {
        URL_SAFE_NO_PAD.encode(data)
    };
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("clock is after the epoch")
        .as_secs();
    // same alphabet as `django.core.signing.b62_encode`
    let value = format!("{payload}:{}", base62::encode(timestamp));
    let signature = salted_hmac(&format!("{salt}signer"), value.as_bytes(), secret)
        .finalize()
        .into_bytes();
    format!("{value}:{}", URL_SAFE_NO_PAD.encode(signature))
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

#[cfg(test)]
mod tests {
    #[test]
    fn base62_matches_django() {
        // django.core.signing.b62_encode(0), (61), (62), (1760000000)
        assert_eq!(base62::encode(0u64), "0");
        assert_eq!(base62::encode(61u64), "z");
        assert_eq!(base62::encode(62u64), "10");
        assert_eq!(base62::encode(1760000000u64), "1v6mOm");
    }
}
