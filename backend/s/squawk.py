#!/usr/bin/env python3
import logging
import os
import subprocess
from pathlib import Path

APP_LABEL = "recipeyak"

MIGRATIONS_DIRECTORY = "./recipeyak/migrations"


logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__file__)


def get_migration_id(filename: str) -> str:
    return Path(filename).stem


def main() -> None:
    diff_cmd = [
        "git",
        "--no-pager",
        "diff",
        "--name-only",
        "origin/master...",
        MIGRATIONS_DIRECTORY,
    ]

    changed_migrations_ids = [
        (get_migration_id(p), p)
        for p in subprocess.run(diff_cmd, capture_output=True, check=True)
        .stdout.decode()
        .split()
    ]
    log.info("found migrations: %s", changed_migrations_ids)

    # get sqlmigrate to behave
    os.environ.setdefault("DEBUG", "1")
    os.environ.setdefault(
        "DATABASE_URL", "postgres://postgres:postgres@127.0.0.1:5432/postgres"
    )

    subprocess.run(["./.venv/bin/python", "./manage.py", "migrate"], check=True)

    output_files = []

    for migration_id, filename in changed_migrations_ids:
        log.info("getting sql for %s", filename)
        output_sql_file = (
            (Path(".").parent / filename.removeprefix("backend/"))
            .with_suffix(".sql")
            .open(mode="w")
        )
        subprocess.run(
            [
                "./.venv/bin/python",
                "./manage.py",
                "sqlmigrate",
                APP_LABEL,
                migration_id,
            ],
            stdout=output_sql_file,
            check=True,
        )
        log.info("running sqlmigrate for %s", filename)
        output_files.append(output_sql_file.name)

    log.info("sql files found: %s", output_files)


if __name__ == "__main__":
    main()
