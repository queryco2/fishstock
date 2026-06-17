from app.providers.base import QuoteProvider
from app.providers.demo_provider import DemoProvider
from app.providers.eastmoney_provider import EastMoneyProvider
from app.providers.tencent_provider import TencentProvider
from app.providers.tiantian_provider import TiantianProvider
from app.schemas.quote import Quote


class QuoteService:
    def __init__(self):
        self.providers: list[QuoteProvider] = [
            TencentProvider(),
            EastMoneyProvider(),
            TiantianProvider(),
            DemoProvider(),
        ]
        self.last_success_provider = "none"
        self.last_error: str | None = None
        self.last_success_at: str | None = None

    def get_quotes(self, symbols: list[str]) -> list[Quote]:
        requested = {symbol.split(".")[-1] for symbol in symbols}
        collected: dict[str, Quote] = {}
        errors: list[str] = []

        for provider in self.providers:
            missing = [symbol for symbol in symbols if symbol.split(".")[-1] not in collected]
            if not missing:
                break

            try:
                for quote in provider.get_quotes(missing):
                    if quote.symbol in requested and quote.symbol not in collected:
                        collected[quote.symbol] = quote
                        self.last_success_provider = provider.name
                        self.last_success_at = quote.updatedAt
            except Exception as exc:
                errors.append(f"{provider.name}: {exc}")
                continue

        self.last_error = "; ".join(errors) if errors else None
        return [collected[symbol.split(".")[-1]] for symbol in symbols if symbol.split(".")[-1] in collected]

    def status(self):
        return {
            "primary": self.providers[0].name,
            "fallback": [provider.name for provider in self.providers[1:]],
            "status": "normal" if self.last_error is None else "degraded",
            "lastSuccessProvider": self.last_success_provider,
            "lastSuccessAt": self.last_success_at,
            "lastError": self.last_error,
        }
