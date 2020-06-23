#!/usr/bin/env python3
import os
import subprocess
from shutil import which
import logging
from pathlib import Path
from typing import Optional
from dataclasses import dataclass
import base64

APP_LABEL = "core"

MIGRATIONS_DIRECTORY = "./backend/core/migrations"


logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__file__)


def is_installed(name: str) -> bool:
    return which(name) is not None


def get_migration_id(filename: str) -> str:
    return Path(filename).stem.split("_")[0]


@dataclass(frozen=True)
class PRInfo:
    owner: str
    repo: str
    pr_number: str


def get_pr_info() -> Optional[PRInfo]:
    circle_pr = os.getenv("CIRCLE_PULL_REQUEST")
    if circle_pr is None:
        return None
    _, _, _, owner, repo, _, pr_number = circle_pr.split("/")

    return PRInfo(owner=owner, repo=repo, pr_number=pr_number)


def main() -> None:
    # circle's built in git checkout code clobbers the `master` ref so we do the
    # following to make it not point to the current ref.
    # https://discuss.circleci.com/t/git-checkout-of-a-branch-destroys-local-reference-to-master/23781/7
    if os.getenv("CIRCLECI"):
        subprocess.run(["git", "branch", "-f", "master", "origin/master"], check=True)

    if not is_installed("squawk"):
        subprocess.run(["npm", "config", "set", "unsafe-perm", "true"], check=True)
        log.info("squawk not found, installing")
        subprocess.run(["npm", "install", "-g", "squawk-cli@0.1.4"], check=True)

    diff_cmd = [
        "git",
        "--no-pager",
        "diff",
        "--name-only",
        "master..",
        MIGRATIONS_DIRECTORY,
    ]

    changed_migrations_ids = [
        (get_migration_id(p), p)
        for p in subprocess.run(diff_cmd, capture_output=True, check=True)
        .stdout.decode()
        .split()
    ]
    log.info("found migrations: %s", changed_migrations_ids)

    pr_info = get_pr_info()
    assert pr_info is not None
    log.info(pr_info)

    os.environ.setdefault("GITHUB_PR_NUMBER", pr_info.pr_number)
    os.environ.setdefault("GITHUB_REPO_NAME", pr_info.repo)
    os.environ.setdefault("GITHUB_REPO_OWNER", pr_info.owner)
    os.environ.setdefault("DEBUG", "1")
    os.environ.setdefault("DATABASE_URL", "postgres://postgres@127.0.0.1:5432/postgres")
    os.environ.setdefault(
        "GITHUB_PRIVATE_KEY",
        base64.b64decode(os.environ["GITHUB_PRIVATE_KEY_BASE64"]).decode(),
    )

    for env_var in {
        "GITHUB_APP_ID",
        "GITHUB_BOT_NAME",
        "GITHUB_INSTALL_ID",
        "GITHUB_PRIVATE_KEY",
    }:
        assert env_var in os.environ, env_var

    for migration_id, filename in changed_migrations_ids:
        log.info("getting sql for %s", filename)
        output_sql_file = (Path(".") / filename).with_suffix(".sql").open(mode="w")
        subprocess.run(
            ["poetry", "run", "yak", "django", "sqlmigrate", APP_LABEL, migration_id],
            stdout=output_sql_file,
            check=True,
        )
        log.info("running squawk for %s", filename)
        log.info(
            subprocess.run(
                ["squawk", "upload-to-github", output_sql_file.name],
                capture_output=True,
            )
        )


if __name__ == "__main__":
    main()
