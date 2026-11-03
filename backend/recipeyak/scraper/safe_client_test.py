import socket
from unittest.mock import patch

import pytest

from recipeyak.scraper.safe_client import UnacceptableAddressError, safe_client


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1/",
        "http://localhost/",
        "http://10.0.0.1/",
        "http://192.168.1.1/",
        "http://169.254.169.254/latest/meta-data/",
        "http://100.64.0.1/",
        "http://0.0.0.0/",
        "http://[::1]/",
        "http://[::ffff:127.0.0.1]/",
        "http://[fd00::1]/",
        "http://224.0.0.1/",
        "https://127.0.0.1/",
    ],
)
def test_rejects_non_public_addresses(url: str) -> None:
    with (
        safe_client(timeout=1, retries=0) as http,
        pytest.raises(UnacceptableAddressError),
    ):
        http.get(url)


def test_rejects_host_with_any_non_public_address() -> None:
    """
    A host that resolves to both a public and a private address shouldn't let
    us connect to either.
    """
    addresses = [
        (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.215.14", 80)),
        (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", 80)),
    ]
    with (
        patch("socket.getaddrinfo", return_value=addresses),
        patch("httpcore.SyncBackend.connect_tcp") as connect_tcp,
        safe_client(timeout=1, retries=0) as http,
        pytest.raises(UnacceptableAddressError),
    ):
        http.get("http://example.com/")
    connect_tcp.assert_not_called()


def test_connects_to_validated_address() -> None:
    addresses = [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.215.14", 80))]
    with (
        patch("socket.getaddrinfo", return_value=addresses),
        patch(
            "httpcore.SyncBackend.connect_tcp", side_effect=ConnectionAbortedError
        ) as connect_tcp,
        safe_client(timeout=1, retries=0) as http,
        pytest.raises(ConnectionAbortedError),
    ):
        http.get("http://example.com/")
    assert connect_tcp.call_args.args[:2] == ("93.184.215.14", 80)
