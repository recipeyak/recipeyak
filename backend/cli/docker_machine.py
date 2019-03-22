import os
import subprocess


def docker_machine_unset_env() -> None:
    if os.getenv("DOCKER_MACHINE_NAME"):
        # vars derived from `docker-machin-env`
        for envvar in {
            "DOCKER_CERT_PATH",
            "DOCKER_CERT_PATH",
            "DOCKER_HOST",
            "DOCKER_MACHINE_NAME",
            "DOCKER_MACHINE_NAME",
            "DOCKER_TLS_VERIFY",
        }:
            os.unsetenv(envvar)


def docker_machine_env(machine_name: str) -> None:
    docker_machine_unset_env()

    env = ()
    try:
        env = (
            subprocess.check_output(f"docker-machine env {machine_name}", shell=True)
            .decode()
            .split("\n")
        )
    except subprocess.CalledProcessError:
        exit(1)

    for l in env:
        if l.startswith("export"):
            # export FOO="127.0.0.1" --> ('FOO', '"127.0.0.1"')
            start, end = l.replace("export", "").strip().split("=")
            os.environ[start] = end.strip('"')
