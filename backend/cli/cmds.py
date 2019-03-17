import os
from typing import List


def prettier(check: bool) -> str:
    check_flag = "--list-different" if check else "--write"
    glob = "frontend/**/*.{js,jsx,scss,css,ts,tsx,json}"
    return f"$(yarn bin)/prettier '{glob}' {check_flag}"


def mypy() -> str:
    from pathlib import Path

    files = " ".join(
        str(p)
        for p in Path("backend").rglob("*.py")
        if ".ropeproject" not in str(p) and ".venv" not in str(p)
    )

    return f"mypy --config-file tox.ini {files}"


def pylint() -> str:
    from pathlib import Path

    python_dirs = " ".join(
        list(str(p.parent) for p in Path("backend").glob("*/__init__.py"))
    )
    return f"pylint --rcfile='.pylintrc' {python_dirs}"


def black(check: bool) -> str:
    check_flag = "--check" if check else ""
    return f"black . {check_flag}"


def tslint() -> str:
    return "node_modules/.bin/tslint --project tsconfig.json --format 'codeFrame'"


def typescript(watch: bool) -> str:
    watch_flag = "--watch" if watch else ""
    return f"node_modules/.bin/tsc --noEmit {watch_flag}"


def flake8() -> str:
    return "flake8 ."


def pytest(watch: bool, args: List[str]) -> str:
    args_str = " ".join(args)
    if watch:
        return f"ptw -- {args_str}"

    return f"pytest {args_str}"


def jest() -> str:
    if os.getenv("CI"):
        return "node scripts/test.js --env=jsdom --coverage --runInBand"
    return "node scripts/test.js --env=jsdom"
