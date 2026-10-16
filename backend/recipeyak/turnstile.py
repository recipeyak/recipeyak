import httpx

from recipeyak import config


def verify_token(token: str) -> bool:
    if not config.TURNSTILE_SECRET_KEY:
        raise ValueError("TURNSTILE_SECRET_KEY is not configured")
    res = httpx.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data={"secret": config.TURNSTILE_SECRET_KEY, "response": token},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()["success"] is True
