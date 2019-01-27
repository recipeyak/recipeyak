from typing import Optional
from dataclasses import dataclass
from enum import Enum
import re
from itertools import chain


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


BROWSERS = (
    (re.compile("Chrome"), Browser.chrome),
    (re.compile("Safari"), Browser.safari),
    (re.compile("Firefox"), Browser.firefox),
    (re.compile("Opera"), Browser.opera),
    (re.compile("IE"), Browser.ie),
)

MOBILE_DEVICES = (
    (re.compile("Android"), OS.Android),
    (re.compile("iPhone"), OS.IPhone),
    (re.compile("iPad"), OS.IPad),
)

DESKTOP_DEVICES = (
    (re.compile("Linux"), OS.Linux),
    (re.compile("Mac OS X 10[._]9"), OS.OSX_Mavericks),
    (re.compile("Mac OS X 10[._]10"), OS.OSX_Yosemite),
    (re.compile("Mac OS X 10[._]11"), OS.OSX_El_Capitan),
    (re.compile("Mac OS X 10[._]12"), OS.MacOS_Sierra),
    (re.compile("Mac OS X 10[._]13"), OS.MacOS_High_Sierra),
    (re.compile("Mac OS X"), OS.OSX),
    (re.compile("NT 5.1"), OS.Windows_XP),
    (re.compile("NT 6.0"), OS.Windows_Vista),
    (re.compile("NT 6.1"), OS.Windows_7),
    (re.compile("NT 6.2"), OS.Windows_8),
    (re.compile("NT 6.3"), OS.Windows_8_1),
    (re.compile("NT 10.0"), OS.Windows_10),
    (re.compile("Windows"), OS.Windows),
)


def get_os(user_agent: str) -> Optional[OS]:
    for regex, name in chain(MOBILE_DEVICES, DESKTOP_DEVICES):
        if regex.search(user_agent):
            return name
    return None


def get_browser(user_agent: str) -> Optional[Browser]:
    for regex, name in BROWSERS:
        if regex.search(user_agent):
            return name
    return None


def get_kind(user_agent: str) -> Optional[DeviceKind]:
    for regex, mobile in MOBILE_DEVICES:
        if regex.search(user_agent):
            return DeviceKind.mobile

    for regex, desktop in DESKTOP_DEVICES:
        if regex.search(user_agent):
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
