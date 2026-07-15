from datetime import datetime

import requests

from app.providers.base import QuoteProvider
from app.providers.utils import detect_market, detect_type, is_hk_code, parse_symbol, now_text, safe_float
from app.schemas.quote import Quote


class TencentProvider(QuoteProvider):
    name = "tencent"

    def get_quotes(self, symbols: list[str]) -> list[Quote]:
        result: list[Quote] = []
        updated_at = now_text()
        symbol_map = {to_tencent_symbol(raw_symbol): parse_symbol(raw_symbol) for raw_symbol in symbols}
        query = ",".join(symbol_map.keys())

        if not query:
            return result

        response = requests.get(
            f"https://qt.gtimg.cn/q={query}",
            headers={"User-Agent": "Mozilla/5.0", "Cache-Control": "no-cache", "Pragma": "no-cache"},
            params={"_": int(datetime.now().timestamp() * 1000)},
            timeout=8,
        )
        response.raise_for_status()
        text = response.content.decode("gbk", errors="ignore")

        for line in text.strip().split(";"):
            if not line.strip() or "=" not in line or '"' not in line:
                continue
            key = line.split("=")[0].split("_")[-1]
            parts = line.split('"')[1].split("~")
            if len(parts) < 53:
                continue

            code, market_hint = symbol_map.get(key, (key[2:], None))
            market = detect_market(code, market_hint)

            result.append(
                Quote(
                    symbol=code,
                    market=market,
                    type=detect_type(code),
                    name=parts[1] or code,
                    price=safe_float(parts[3]),
                    changeAmount=safe_float(parts[31]),
                    changePercent=safe_float(parts[32]),
                    volume=safe_float(parts[36]),
                    amount=parse_amount(parts[37], market),
                    source=self.name,
                    status="normal",
                    updatedAt=parse_tencent_time(parts[30]) or updated_at,
                )
            )

        return result


def to_tencent_symbol(raw_symbol: str) -> str:
    code, market_hint = parse_symbol(raw_symbol)
    if market_hint == "HK" or (market_hint is None and is_hk_code(code)):
        return f"hk{code}"
    if market_hint == "SH" or (market_hint is None and code.startswith(("5", "6", "9"))):
        return f"sh{code}"
    if market_hint == "BJ" or (market_hint is None and code.startswith(("4", "8"))):
        return f"bj{code}"
    if market_hint == "INDEX" and code.startswith(("0", "9")):
        return f"sh{code}"
    return f"sz{code}"


def parse_amount(value, market: str) -> float | None:
    parsed = safe_float(value)
    if parsed is None:
        return None
    if market == "HK":
        return parsed
    return parsed * 10000


def parse_tencent_time(value: str) -> str | None:
    text = value.strip()
    if len(text) != 14 or not text.isdigit():
        return None
    return f"{text[0:4]}-{text[4:6]}-{text[6:8]} {text[8:10]}:{text[10:12]}:{text[12:14]}"
