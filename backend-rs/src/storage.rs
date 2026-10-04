use url::Url;

/// Port of `recipeyak.models.upload.public_url`.
pub fn public_url(storage_url: &Url, key: &str) -> String {
    let mut url = storage_url.clone();
    // `set_path` treats `%` as an existing escape, but keys are raw (they
    // include user provided file names) so escape it like yarl does.
    url.set_path(&key.replace('%', "%25"));
    url.into()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn public_url_joins_key() {
        let base = Url::parse("https://images-cdn.recipeyak.com").unwrap();
        assert_eq!(
            public_url(&base, "1/abc/my image.jpg"),
            "https://images-cdn.recipeyak.com/1/abc/my%20image.jpg"
        );
        // expected values from yarl's `URL.with_path`
        assert_eq!(
            public_url(&base, "a/b+c&d=e%20f.png"),
            "https://images-cdn.recipeyak.com/a/b+c&d=e%2520f.png"
        );
        assert_eq!(
            public_url(&base, "a?b#c.jpg"),
            "https://images-cdn.recipeyak.com/a%3Fb%23c.jpg"
        );
        assert_eq!(
            public_url(&base, "x/\u{fc}.jpg"),
            "https://images-cdn.recipeyak.com/x/%C3%BC.jpg"
        );
    }
}
