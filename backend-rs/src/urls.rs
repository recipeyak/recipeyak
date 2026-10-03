//! URL helpers ported from `recipeyak.models.upload.public_url` and
//! `recipeyak.models.user.get_avatar_url`.

use md5::{Digest, Md5};

/// `str(URL(f"https://{hostname}").with_path(key))` from yarl: resolve dot
/// segments, ensure a leading `/`, and percent-encode everything outside
/// yarl's path-safe set (including `%`).
pub fn public_url(storage_hostname: &str, key: &str) -> String {
    let path = remove_dot_segments(key);
    let mut url = format!("https://{storage_hostname}");
    if path.is_empty() {
        return url;
    }
    if !path.starts_with('/') {
        url.push('/');
    }
    for b in path.bytes() {
        if b.is_ascii_alphanumeric() || b"-._~!$'()*,+&=;@:/".contains(&b) {
            url.push(b as char);
        } else {
            url.push_str(&format!("%{b:02X}"));
        }
    }
    url
}

fn remove_dot_segments(path: &str) -> String {
    if !path.split('/').any(|s| s == "." || s == "..") {
        return path.to_string();
    }
    let mut out: Vec<&str> = Vec::new();
    let segments: Vec<&str> = path.trim_start_matches('/').split('/').collect();
    let last = segments.len() - 1;
    for (i, segment) in segments.into_iter().enumerate() {
        match segment {
            "." => {}
            ".." => {
                out.pop();
            }
            s => out.push(s),
        }
        // a trailing dot segment leaves a trailing slash
        if i == last && (segment == "." || segment == "..") {
            out.push("");
        }
    }
    format!("/{}", out.join("/"))
}

pub fn avatar_url(storage_hostname: &str, email: &str, profile_upload_key: Option<&str>) -> String {
    if let Some(key) = profile_upload_key {
        return public_url(storage_hostname, key);
    }
    let md5_email = Md5::digest(email.as_bytes());
    let hex: String = md5_email.iter().map(|b| format!("{b:02x}")).collect();
    format!("/avatar/{hex}?d=identicon&r=g")
}

#[cfg(test)]
mod tests {
    use super::*;

    const HOST: &str = "images-cdn.recipeyak.com";

    #[test]
    fn public_url_matches_yarl() {
        let cases = [
            (
                "scraper/11a06c471126419594423e5373712d66.jpg",
                "https://images-cdn.recipeyak.com/scraper/11a06c471126419594423e5373712d66.jpg",
            ),
            ("a/b c.jpg", "https://images-cdn.recipeyak.com/a/b%20c.jpg"),
            (
                "/x/é?.png",
                "https://images-cdn.recipeyak.com/x/%C3%A9%3F.png",
            ),
            ("a%20b", "https://images-cdn.recipeyak.com/a%2520b"),
            ("a/../b.jpg", "https://images-cdn.recipeyak.com/b.jpg"),
            ("./a/./b", "https://images-cdn.recipeyak.com/a/b"),
            ("a//b", "https://images-cdn.recipeyak.com/a//b"),
            ("", "https://images-cdn.recipeyak.com"),
            (
                "!$'()*,+&=;@:~-._[]#",
                "https://images-cdn.recipeyak.com/!$'()*,+&=;@:~-._%5B%5D%23",
            ),
        ];
        for (key, expected) in cases {
            assert_eq!(public_url(HOST, key), expected, "{key}");
        }
    }

    #[test]
    fn avatar_falls_back_to_gravatar_hash() {
        assert_eq!(
            avatar_url(HOST, "j@example.com", None),
            "/avatar/19c7cf93d7e33c17730e5fccd7f4ab2e?d=identicon&r=g"
        );
        assert_eq!(
            avatar_url(HOST, "j@example.com", Some("profile/me.png")),
            "https://images-cdn.recipeyak.com/profile/me.png"
        );
    }
}
