import pytest

from recipeyak import config
from recipeyak.models.upload import public_url


@pytest.mark.parametrize(
    ("key", "expected_path"),
    [
        (
            "57/5d9a34d14ac74b7aa75fdc568a83dce7/5B5CE99F-4912-4BC3-A3CE-C9557E4C24E5.jpeg",
            "/57/5d9a34d14ac74b7aa75fdc568a83dce7/5B5CE99F-4912-4BC3-A3CE-C9557E4C24E5.jpeg",
        ),
        ("/leading-slash.jpg", "/leading-slash.jpg"),
        ("a b/c.jpg", "/a%20b/c.jpg"),
        ("x/100%.jpg", "/x/100%25.jpg"),
        ("x/a+b&c=d?.jpg", "/x/a+b&c=d%3F.jpg"),
        ("x/#frag.jpg", "/x/%23frag.jpg"),
        ("ünï.png", "/%C3%BCn%C3%AF.png"),
    ],
)
def test_public_url(key: str, expected_path: str) -> None:
    assert public_url(key) == f"{config.STORAGE_URL}{expected_path}"


def test_public_url_with_path_prefix(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        config, "STORAGE_URL", "http://localhost:9090/recipeyak-production"
    )
    assert (
        public_url("scraper/a b.jpg")
        == "http://localhost:9090/recipeyak-production/scraper/a%20b.jpg"
    )
