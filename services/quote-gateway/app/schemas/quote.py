from typing import Literal

from pydantic import BaseModel


Market = Literal["SH", "SZ", "BJ", "HK", "US", "FUND", "INDEX"]
WatchItemType = Literal["stock", "fund", "etf", "index"]
QuoteStatus = Literal["normal", "delay", "closed", "error"]


class Quote(BaseModel):
    symbol: str
    market: Market
    type: WatchItemType
    name: str
    price: float | None
    changeAmount: float | None
    changePercent: float | None
    volume: float | None = None
    amount: float | None = None
    source: str
    status: QuoteStatus
    updatedAt: str
    cached: bool = False
