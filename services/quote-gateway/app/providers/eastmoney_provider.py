from app.providers.base import QuoteProvider
from app.providers.utils import detect_market, detect_type, em_get, parse_symbol, now_text, safe_float
from app.schemas.quote import Quote


class EastMoneyProvider(QuoteProvider):
    name = "eastmoney"

    def get_quotes(self, symbols: list[str]) -> list[Quote]:
        result: list[Quote] = []
        updated_at = now_text()

        for raw_symbol in symbols:
            code, market_hint = parse_symbol(raw_symbol)
            market = detect_market(code, market_hint)
            secid = f"{eastmoney_market_id(code, market)}.{code}"
            response = em_get(
                "https://push2.eastmoney.com/api/qt/stock/get",
                params={"secid": secid, "fields": "f43,f57,f58,f169,f170,f47,f48"},
                headers={"Referer": "https://quote.eastmoney.com/"},
                timeout=8,
            )
            response.raise_for_status()
            data = response.json().get("data")
            if not data:
                continue

            price = scale_eastmoney_price(data.get("f43"), market)
            change_amount = scale_eastmoney_price(data.get("f169"), market)
            change_percent = scale_eastmoney_number(data.get("f170"))
            result.append(
                Quote(
                    symbol=str(data.get("f57") or code),
                    market=market,
                    type=detect_type(code),
                    name=str(data.get("f58") or code),
                    price=price,
                    changeAmount=change_amount,
                    changePercent=change_percent,
                    volume=safe_float(data.get("f47")),
                    amount=safe_float(data.get("f48")),
                    source=self.name,
                    status="delay",
                    updatedAt=updated_at,
                )
            )

        return result


def scale_eastmoney_number(value) -> float | None:
    parsed = safe_float(value)
    if parsed is None:
        return None
    return parsed / 100


def scale_eastmoney_price(value, market: str) -> float | None:
    parsed = safe_float(value)
    if parsed is None:
        return None
    if market == "HK":
        return parsed / 1000
    return parsed / 100


def eastmoney_market_id(code: str, market: str) -> int:
    if market == "HK":
        return 116
    if market == "SH" or (market == "INDEX" and code.startswith(("0", "9"))):
        return 1
    if market == "BJ":
        return 0
    return 0
