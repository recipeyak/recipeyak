import re
from dataclasses import dataclass
from enum import Enum
from itertools import chain
from typing import List, Optional, Pattern, Tuple, Union


class DeviceKind(str, Enum):
    mobile = "mobile"
    desktop = "desktop"


class Browser(str, Enum):
    chrome = "Chrome"
    safari = "Safari"
    firefox = "Firefox"
    opera = "Opera"
    ie = "Internet Explorer"


class OS(str, Enum):
    Linux = "Linux"
    OSX_Mavericks = "OS X Mavericks"
    OSX_Yosemite = "OS X Yosemite"
    OSX_El_Capitan = "OS X El Capitan"
    MacOS_Sierra = "macOS Sierra"
    MacOS_High_Sierra = "macOS High Sierra"
    MacOS_Mojave = "macOS Mojave"
    OSX = "OS X"
    Windows_XP = "Windows XP"
    Windows_Vista = "Windows Vista"
    Windows_7 = "Windows 7"
    Windows_8 = "Windows 8"
    Windows_8_1 = "Windows 8.1"
    Windows_10 = "Windows 10"
    Windows = "Windows"
    Android = "Android"
    IPhone = "iPhone"
    IPad = "iPad"


@dataclass
class Device:
    kind: Optional[DeviceKind]
    os: Optional[OS]
    browser: Optional[Browser]


BROWSERS = [
    ("Chrome", Browser.chrome),
    ("Safari", Browser.safari),
    ("Firefox", Browser.firefox),
    ("Opera", Browser.opera),
    ("IE", Browser.ie),
]

MOBILE_DEVICES = [("Android", OS.Android), ("iPhone", OS.IPhone), ("iPad", OS.IPad)]

DESKTOP_DEVICES: List[Tuple[Union[str, Pattern], OS]] = [
    ("Linux", OS.Linux),
    (re.compile("Mac OS X 10[._]9"), OS.OSX_Mavericks),
    (re.compile("Mac OS X 10[._]10"), OS.OSX_Yosemite),
    (re.compile("Mac OS X 10[._]11"), OS.OSX_El_Capitan),
    (re.compile("Mac OS X 10[._]12"), OS.MacOS_Sierra),
    (re.compile("Mac OS X 10[._]13"), OS.MacOS_High_Sierra),
    (re.compile("Mac OS X 10[._]14"), OS.MacOS_Mojave),
    ("Mac OS X", OS.OSX),
    ("NT 5.1", OS.Windows_XP),
    ("NT 6.0", OS.Windows_Vista),
    ("NT 6.1", OS.Windows_7),
    ("NT 6.2", OS.Windows_8),
    ("NT 6.3", OS.Windows_8_1),
    ("NT 10.0", OS.Windows_10),
    ("Windows", OS.Windows),
]


def get_os(user_agent: str) -> Optional[OS]:
    for substr_name, name in chain(MOBILE_DEVICES, DESKTOP_DEVICES):
        if isinstance(substr_name, str):
            if substr_name in user_agent:
                return name
        elif substr_name.search(user_agent):
            return name

    return None


def get_browser(user_agent: str) -> Optional[Browser]:
    for browser, name in BROWSERS:
        if browser in user_agent:
            return name
    return None


def get_kind(user_agent: str) -> Optional[DeviceKind]:
    for name, _ in MOBILE_DEVICES:
        if name in user_agent:
            return DeviceKind.mobile

    for matcher, _ in DESKTOP_DEVICES:
        if isinstance(matcher, str):
            if matcher in user_agent:
                return DeviceKind.desktop
        elif matcher.search(user_agent):
            return DeviceKind.desktop
    return None


def parse(user_agent: str) -> Device:
    """
    attempt to parse a User Agent
    """
    kind = get_kind(user_agent)
    os = get_os(user_agent)
    browser = get_browser(user_agent)
    return Device(kind=kind, os=os, browser=browser)
