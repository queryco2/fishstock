import efinance as ef

from app.providers.base import QuoteProvider
from app.providers.utils import detect_market, detect_type, normalize_symbol, now_text, safe_float
from app.schemas.quote import Quote


class EFinanceProvider(QuoteProvider):
    name = "efinance"

    def get_quotes(self, symbols: list[str]) -> list[Quote]:
        codes = {normalize_symbol(symbol) for symbol in symbols}
        df = ef.stock.get_realtime_quotes()
        df["股票代码"] = df["股票代码"].astype(str)
        df = df[df["股票代码"].isin(codes)]
        updated_at = now_text()

        return [
            Quote(
                symbol=str(row["股票代码"]),
                market=detect_market(str(row["股票代码"])),
                type=detect_type(str(row["股票代码"])),
                name=str(row["股票名称"]),
                price=safe_float(row.get("最新价")),
                changeAmount=safe_float(row.get("涨跌额")),
                changePercent=safe_float(row.get("涨跌幅")),
                volume=safe_float(row.get("成交量")),
                amount=safe_float(row.get("成交额")),
                source=self.name,
                status="normal",
                updatedAt=updated_at,
            )
            for _, row in df.iterrows()
        ]
