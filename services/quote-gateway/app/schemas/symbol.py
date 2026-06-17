from pydantic import BaseModel

from .quote import Market, WatchItemType


class SymbolSearchResult(BaseModel):
    symbol: str
    market: Market
    type: WatchItemType
    name: str
