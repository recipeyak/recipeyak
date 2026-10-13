//! URL helpers ported from `recipeyak.models.upload.public_url` and
//! `recipeyak.models.user.get_avatar_url`.

use md5::{Digest, Md5};
use url::Url;

pub fn public_url(storage_url: &Url, key: &str) -> String {
    let mut url = storage_url.clone();
    url.path_segments_mut().unwrap().extend(key.split('/'));
    url.into()
}

pub fn avatar_url(storage_url: &Url, email: &str, profile_upload_key: Option<&str>) -> String {
    if let Some(key) = profile_upload_key {
        return public_url(storage_url, key);
    }
    let md5_email = Md5::digest(email.as_bytes());
    let hex: String = md5_email.iter().map(|b| format!("{b:02x}")).collect();
    format!("/avatar/{hex}?d=identicon&r=g")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn host() -> Url {
        Url::parse("https://images-cdn.recipeyak.com").unwrap()
    }

    #[test]
    fn public_url_matches_yarl() {
        // file names from core_upload with fresh ids, expected values from yarl
        let cases = [
            (
                "scraper/2cdbb142c41144cab58b610fb000d3dc.jpg",
                "https://images-cdn.recipeyak.com/scraper/2cdbb142c41144cab58b610fb000d3dc.jpg",
            ),
            (
                "1/9f574ead181347c7a7b689158b5f3cd2/BANYAN DINNER MENU 9.14.23.pdf",
                "https://images-cdn.recipeyak.com/1/9f574ead181347c7a7b689158b5f3cd2/BANYAN%20DINNER%20MENU%209.14.23.pdf",
            ),
            (
                // macOS puts a narrow no-break space before PM
                "1/8f5baf9336ca4da09fa8847d15eb422f/Screenshot 2023-11-24 at 6.16.20\u{202f}PM.png",
                "https://images-cdn.recipeyak.com/1/8f5baf9336ca4da09fa8847d15eb422f/Screenshot%202023-11-24%20at%206.16.20%E2%80%AFPM.png",
            ),
            (
                "14/5522a95811264c3599b4480f0c962115/IMG_1940 (1).jpeg",
                "https://images-cdn.recipeyak.com/14/5522a95811264c3599b4480f0c962115/IMG_1940%20(1).jpeg",
            ),
            (
                "14/5123270e6e774459bde53df2b98fd050/Fisherman's Cottage on the Cliffs at Varengeville — Cloude Monet (1882) copy.jpg",
                "https://images-cdn.recipeyak.com/14/5123270e6e774459bde53df2b98fd050/Fisherman's%20Cottage%20on%20the%20Cliffs%20at%20Varengeville%20%E2%80%94%20Cloude%20Monet%20(1882)%20copy.jpg",
            ),
            // not in the db yet, but plausible for a recipe photo
            (
                "1/0f/100% rye.jpg",
                "https://images-cdn.recipeyak.com/1/0f/100%25%20rye.jpg",
            ),
        ];
        for (key, expected) in cases {
            assert_eq!(public_url(&host(), key), expected, "{key}");
        }
    }

    #[test]
    fn avatar_falls_back_to_gravatar_hash() {
        assert_eq!(
            avatar_url(&host(), "j@example.com", None),
            "/avatar/19c7cf93d7e33c17730e5fccd7f4ab2e?d=identicon&r=g"
        );
        assert_eq!(
            avatar_url(&host(), "j@example.com", Some("profile/me.png")),
            "https://images-cdn.recipeyak.com/profile/me.png"
        );
    }
}
