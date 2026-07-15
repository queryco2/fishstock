import os

import requests
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.providers.demo_provider import DEMO_NAMES
from app.providers.utils import detect_market, detect_type, now_text
from app.schemas.quote import Quote
from app.schemas.symbol import SymbolSearchResult
from app.services.quote_service import QuoteService

app = FastAPI(title="FishStock Quote Gateway")
quote_service = QuoteService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "time": now_text()}


@app.get("/api/symbols/search", response_model=list[SymbolSearchResult])
def search_symbols(keyword: str = Query("", max_length=40)):
    trimmed = keyword.strip().lower()
    local = [
        SymbolSearchResult(symbol=code, market=detect_market(code), type=detect_type(code), name=name)
        for code, name in DEMO_NAMES.items()
    ]

    if trimmed:
        local = [item for item in local if trimmed in item.symbol.lower() or trimmed in item.name.lower()]

    if local:
        return local[:8]

    try:
        return eastmoney_search_symbols(trimmed)[:8]
    except Exception:
        return []


@app.get("/api/quotes", response_model=list[Quote])
def get_quotes(symbols: str = Query(...)):
    symbol_list = [symbol.strip() for symbol in symbols.split(",") if symbol.strip()]
    return quote_service.get_quotes(symbol_list)


@app.get("/api/source/status")
def source_status():
    return quote_service.status()


def eastmoney_search_symbols(keyword: str) -> list[SymbolSearchResult]:
    params = {
        "input": keyword,
        "type": "14",
    }
    search_token = os.getenv("EASTMONEY_SEARCH_TOKEN")
    if search_token:
        params["token"] = search_token

    response = requests.get(
        "https://searchapi.eastmoney.com/api/suggest/get",
        params=params,
        headers={"User-Agent": "Mozilla/5.0", "Referer": "https://quote.eastmoney.com/"},
        timeout=8,
    )
    response.raise_for_status()
    rows = response.json().get("QuotationCodeTable", {}).get("Data", []) or []
    results: list[SymbolSearchResult] = []

    for row in rows:
        code = str(row.get("Code") or row.get("UnifiedCode") or "")
        name = str(row.get("Name") or "")
        if not code or not name:
            continue

        market = eastmoney_result_market(row, code)
        results.append(
            SymbolSearchResult(
                symbol=code,
                market=market,
                type=detect_type(code),
                name=name,
            )
        )

    return results


def eastmoney_result_market(row: dict, code: str):
    quote_id = str(row.get("QuoteID") or "")
    market_type = str(row.get("MarketType") or row.get("MktNum") or "")
    exchange = str(row.get("JYS") or row.get("Classify") or "").upper()
    if quote_id.startswith("116.") or market_type in {"5", "116"} or exchange == "HK":
        return "HK"
    if quote_id.startswith("1.") or market_type == "1":
        return "SH"
    if quote_id.startswith("0.") or market_type == "0":
        return "SZ"
    return detect_market(code)
