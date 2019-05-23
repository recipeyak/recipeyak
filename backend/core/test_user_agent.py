import pytest

from core import user_agent
from core.user_agent import OS, Browser, Device, DeviceKind


@pytest.mark.parametrize(
    "agent, expected",
    [
        (
            "Mozilla/4.0 (Windows; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727)",
            Device(kind=DeviceKind.desktop, browser=Browser.ie, os=OS.Windows_XP),
        ),
        (
            "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; SLCC1; .NET CLR 2.0.50727; .NET CLR 1.1.4322; InfoPath.2; .NET CLR 3.5.21022; .NET CLR 3.5.30729; MS-RTC LM 8; OfficeLiveConnector.1.4; OfficeLivePatch.1.3; .NET CLR 3.0.30729)",
            Device(kind=DeviceKind.desktop, browser=Browser.ie, os=OS.Windows_Vista),
        ),
        (
            "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
            Device(kind=DeviceKind.desktop, browser=Browser.ie, os=OS.Windows_7),
        ),
        (
            "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)",
            Device(kind=DeviceKind.desktop, os=OS.Windows_8, browser=Browser.ie),
        ),
        (
            "Mozilla/5.0 (IE 11.0; Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko",
            Device(kind=DeviceKind.desktop, os=OS.Windows_8_1, browser=Browser.ie),
        ),
        (
            "Mozilla/5.0 (iPad; U; CPU OS 4_2_1 like Mac OS X; ja-jp) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5",
            Device(kind=DeviceKind.mobile, os=OS.IPad, browser=Browser.safari),
        ),
        (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53",
            Device(kind=DeviceKind.mobile, os=OS.IPhone, browser=Browser.safari),
        ),
        (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.17 (KHTML, like Gecko) Version/6.0.2 Safari/536.26.17",
            Device(kind=DeviceKind.desktop, os=OS.OSX, browser=Browser.safari),
        ),
        (
            "Mozilla/5.0 (Linux; U; Android 1.5; de-de; HTC Magic Build/CRB17) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
            Device(kind=DeviceKind.mobile, os=OS.Android, browser=Browser.safari),
        ),
        (
            "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:22.0) Gecko/20130328 Firefox/22.0",
            Device(kind=DeviceKind.desktop, os=OS.Windows_7, browser=Browser.firefox),
        ),
        (
            "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
            Device(kind=DeviceKind.desktop, os=OS.Windows_8_1, browser=Browser.chrome),
        ),
        (
            "Not a legit OS Firefox/51.0",
            Device(kind=None, os=None, browser=Browser.firefox),
        ),
        (
            "Not a legit OS Chrome/54.0.32",
            Device(kind=None, os=None, browser=Browser.chrome),
        ),
        (
            "Not a legit OS Safari/5.2",
            Device(kind=None, os=None, browser=Browser.safari),
        ),
        (
            "Linux not a real browser/10.3",
            Device(kind=DeviceKind.desktop, os=OS.Linux, browser=None),
        ),
        (
            "iPad not a real browser/10.3",
            Device(kind=DeviceKind.mobile, os=OS.IPad, browser=None),
        ),
        (
            "Not a legit OS Safari/5.2",
            Device(kind=None, os=None, browser=Browser.safari),
        ),
        (
            "iPhone not a real browser/10.3",
            Device(kind=DeviceKind.mobile, os=OS.IPhone, browser=None),
        ),
        (
            "NT 5.1 not a real browser/10.3",
            Device(kind=DeviceKind.desktop, os=OS.Windows_XP, browser=None),
        ),
        (
            "NT 6.0 not a real browser/10.3",
            Device(kind=DeviceKind.desktop, os=OS.Windows_Vista, browser=None),
        ),
        (
            "NT 6.1 not a real browser/10.3",
            Device(kind=DeviceKind.desktop, os=OS.Windows_7, browser=None),
        ),
        (
            "NT 6.2 not a real browser/10.3",
            Device(kind=DeviceKind.desktop, os=OS.Windows_8, browser=None),
        ),
        (
            "NT 6.3 not a real browser/10.3",
            Device(kind=DeviceKind.desktop, os=OS.Windows_8_1, browser=None),
        ),
        ("Windows", Device(kind=DeviceKind.desktop, os=OS.Windows, browser=None)),
    ],
)
def test_user_agent(agent: str, expected: Device) -> None:
    assert user_agent.parse(agent) == expected
