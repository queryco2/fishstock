import math
import time

from app.providers.base import QuoteProvider
from app.providers.utils import detect_market, detect_type, normalize_symbol, now_text
from app.schemas.quote import Quote


DEMO_NAMES = {
    "600519": "贵州茅台",
    "300750": "宁德时代",
    "000001": "平安银行",
    "601318": "中国平安",
    "600036": "招商银行",
    "510300": "沪深300ETF",
    "159915": "创业板ETF",
    "000300": "沪深300",
}


class DemoProvider(QuoteProvider):
    name = "demo"

    def get_quotes(self, symbols: list[str]) -> list[Quote]:
        updated_at = now_text()
        quotes: list[Quote] = []

        for index, raw_symbol in enumerate(symbols):
            code = normalize_symbol(raw_symbol)
            seed = sum(ord(char) for char in code)
            drift = math.sin(time.time() / 20 + index) * 0.8
            price = round(seed % 900 + 20 + drift, 2)
            change_percent = round(seed % 13 - 6 + drift, 2)

            quotes.append(
                Quote(
                    symbol=code,
                    market=detect_market(code),
                    type=detect_type(code),
                    name=DEMO_NAMES.get(code, f"演示标的 {code}"),
                    price=price,
                    changeAmount=round(price * change_percent / 100, 2),
                    changePercent=change_percent,
                    source=self.name,
                    status="delay",
                    updatedAt=updated_at,
                    cached=True,
                )
            )

        return quotes
