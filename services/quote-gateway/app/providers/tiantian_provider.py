import json
import re

import requests

from app.providers.base import QuoteProvider
from app.providers.utils import normalize_symbol, now_text, safe_float
from app.schemas.quote import Quote


class TiantianProvider(QuoteProvider):
    name = "tiantian"

    def get_quotes(self, symbols: list[str]) -> list[Quote]:
        result: list[Quote] = []
        updated_at = now_text()

        for raw_symbol in symbols:
            code = normalize_symbol(raw_symbol)
            response = requests.get(f"https://fundgz.1234567.com.cn/js/{code}.js", timeout=4)
            response.raise_for_status()
            match = re.search(r"jsonpgz\((.*)\);?", response.text)
            if not match:
                continue

            payload = json.loads(match.group(1))
            result.append(
                Quote(
                    symbol=code,
                    market="FUND",
                    type="fund",
                    name=payload.get("name") or code,
                    price=safe_float(payload.get("gsz")),
                    changeAmount=None,
                    changePercent=safe_float(payload.get("gszzl")),
                    source=self.name,
                    status="delay",
                    updatedAt=payload.get("gztime") or updated_at,
                )
            )

        return result
