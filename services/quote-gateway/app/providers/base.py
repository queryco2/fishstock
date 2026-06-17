from abc import ABC, abstractmethod

from app.schemas.quote import Quote


class QuoteProvider(ABC):
    name: str

    @abstractmethod
    def get_quotes(self, symbols: list[str]) -> list[Quote]:
        raise NotImplementedError
