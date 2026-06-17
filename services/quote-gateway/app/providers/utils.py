import random
import time
from datetime import datetime

import requests

from app.schemas.quote import Market, WatchItemType


UA = "Mozilla/5.0"
EM_SESSION = requests.Session()
EM_SESSION.headers.update({"User-Agent": UA})
EM_MIN_INTERVAL = 1.0
_em_last_call = [0.0]


def now_text() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def safe_float(value) -> float | None:
    try:
        if value in ("", "-", None):
            return None
        return float(value)
    except Exception:
        return None


def parse_symbol(symbol: str) -> tuple[str, str | None]:
    parts = symbol.strip().upper().split(".")
    if len(parts) == 2 and parts[0] in {"SH", "SZ", "BJ", "HK", "US", "FUND", "INDEX"}:
        return parts[1], parts[0]
    return parts[-1], None


def detect_market(code: str, market_hint: str | None = None) -> Market:
    if market_hint in {"SH", "SZ", "BJ", "HK", "US", "FUND", "INDEX"}:
        return market_hint  # type: ignore[return-value]
    if code.startswith("6"):
        return "SH"
    if code.startswith(("0", "3", "1", "2")):
        return "SZ"
    if code.startswith(("8", "4")):
        return "BJ"
    return "INDEX"


def detect_type(code: str) -> WatchItemType:
    if code.startswith(("5", "1")):
        return "etf"
    if code.startswith(("0", "3", "6", "8", "4")):
        return "stock"
    return "index"


def normalize_symbol(symbol: str) -> str:
    return parse_symbol(symbol)[0]


def em_get(
    url: str,
    params: dict | None = None,
    headers: dict | None = None,
    timeout: int = 15,
    **kwargs,
):
    wait = EM_MIN_INTERVAL - (time.time() - _em_last_call[0])
    if wait > 0:
        time.sleep(wait + random.uniform(0.1, 0.4))

    try:
        return EM_SESSION.get(url, params=params, headers=headers, timeout=timeout, **kwargs)
    finally:
        _em_last_call[0] = time.time()
