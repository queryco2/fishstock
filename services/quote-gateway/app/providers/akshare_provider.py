from app.providers.base import QuoteProvider
from app.providers.utils import detect_market, detect_type, normalize_symbol, now_text, safe_float
from app.schemas.quote import Quote


class AkShareProvider(QuoteProvider):
    name = "akshare"

    def get_quotes(self, symbols: list[str]) -> list[Quote]:
        import akshare as ak

        codes = {normalize_symbol(symbol) for symbol in symbols}
        df = ak.stock_zh_a_spot_em()
        df["代码"] = df["代码"].astype(str)
        df = df[df["代码"].isin(codes)]
        updated_at = now_text()

        return [
            Quote(
                symbol=str(row["代码"]),
                market=detect_market(str(row["代码"])),
                type=detect_type(str(row["代码"])),
                name=str(row["名称"]),
                price=safe_float(row.get("最新价")),
                changeAmount=safe_float(row.get("涨跌额")),
                changePercent=safe_float(row.get("涨跌幅")),
                volume=safe_float(row.get("成交量")),
                amount=safe_float(row.get("成交额")),
                source=self.name,
                status="delay",
                updatedAt=updated_at,
            )
            for _, row in df.iterrows()
        ]
