from __future__ import annotations

import ipaddress
import socket
from collections.abc import Iterable

import httpcore
import httpx


class UnacceptableAddressError(Exception):
    pass


def _is_acceptable(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    # is_global also considers the embedded address of IPv4-mapped IPv6
    # addresses, e.g. ::ffff:127.0.0.1
    return ip.is_global and not ip.is_multicast


class _SafeBackend(httpcore.SyncBackend):
    """
    Refuse to connect to non-public addresses, aka SSRF protection.

    Every connection, including ones made while following redirects, goes
    through here. We connect to the address we validated, so the host can't
    resolve to something else between the check and the connect.
    """

    def connect_tcp(
        self,
        host: str,
        port: int,
        timeout: float | None = None,
        local_address: str | None = None,
        socket_options: Iterable[httpcore.SOCKET_OPTION] | None = None,
    ) -> httpcore.NetworkStream:
        try:
            infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
        except socket.gaierror as e:
            raise httpcore.ConnectError(str(e)) from e
        addresses = [str(sockaddr[0]) for *_, sockaddr in infos]
        for address in addresses:
            if not _is_acceptable(ipaddress.ip_address(address)):
                raise UnacceptableAddressError(f"{host} resolves to {address}")
        last_error: httpcore.ConnectError | httpcore.ConnectTimeout | None = None
        for address in addresses:
            try:
                return super().connect_tcp(
                    address, port, timeout, local_address, socket_options
                )
            except (httpcore.ConnectError, httpcore.ConnectTimeout) as e:
                last_error = e
        assert last_error is not None
        raise last_error


class _SafeTransport(httpx.HTTPTransport):
    def __init__(self, *, retries: int) -> None:
        super().__init__()
        # HTTPTransport doesn't expose httpcore's network_backend
        self._pool = httpcore.ConnectionPool(
            ssl_context=httpx.create_ssl_context(),
            retries=retries,
            network_backend=_SafeBackend(),
        )


def safe_client(*, timeout: float, retries: int) -> httpx.Client:
    """
    `retries` only covers failed connections, not error responses.
    """
    return httpx.Client(
        transport=_SafeTransport(retries=retries),
        timeout=timeout,
        follow_redirects=True,
        # proxies from the environment would bypass the address checks
        trust_env=False,
    )
