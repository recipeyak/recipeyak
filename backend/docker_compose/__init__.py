from __future__ import annotations
import json
from typing import Optional, List, Tuple, Union, Mapping
from typing_extensions import Literal
from copy import deepcopy

from dataclasses import dataclass, asdict


@dataclass
class Service:
    name: str
    image: str
    volumes: List[Tuple[Volume, str]]
    logging: Logger
    command: Optional[Union[str, List[str]]] = None
    depends_on: Optional[List[Service]] = None
    env_file: Optional[List[str]] = None
    restart: Optional[Literal["always"]] = None
    ports: Optional[List[Tuple[int, int]]] = None

    def to_dict(self) -> dict:
        temp = deepcopy(self)
        temp.depends_on = (
            [dep.name for dep in temp.depends_on] if temp.depends_on else None
        )
        temp.ports = (
            [f"{in_port}:{out_port}" for in_port, out_port in temp.ports]
            if temp.ports
            else None
        )
        temp.volumes = [v[0].name + ":" + v[1] for v in temp.volumes]

        temp.name = None

        return {k: v for k, v in asdict(temp).items() if v is not None}


@dataclass
class Compose:
    version: Union[str, int]
    services: List[Service]
    volumes: List[Volume]

    def to_dict(self) -> dict:
        services = {}
        for s in self.services:
            services[s.name] = s.to_dict()

        volumes = {}
        for v in self.volumes:
            volumes[v.name] = v.to_dict()

        return dict(version=str(self.version), services=services, volumes=volumes)

    def to_json(self, indent: int = 2):
        return json.dumps(self.to_dict(), indent=indent)


@dataclass
class Volume:
    name: str
    driver: Union[Literal["local"], str]

    def to_dict(self) -> dict:
        return dict(driver=self.driver)


@dataclass
class Logger:
    driver: Literal[
        "none",
        "json-file",
        "local",
        "syslog",
        "journald",
        "gelf",
        "fluentd",
        "awslogs",
        "splunk",
        "etwlogs",
        "gcplogs",
        "logentries",
    ]
    options: Optional[Mapping[str, str]] = None
