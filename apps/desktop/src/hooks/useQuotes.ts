import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Quote } from '../types/quote';
import type { WatchItem } from '../types/watchItem';
import { fetchQuotes, getFallbackQuotes } from '../api/quoteApi';

export function useQuotes(watchItems: WatchItem[], refreshSeconds: number) {
  const symbols = useMemo(() => watchItems.map((item) => `${item.market}.${item.symbol}`), [watchItems]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (symbols.length === 0) {
      setQuotes([]);
      setError(null);
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetchQuotes(symbols);
      setQuotes(mergeWithWatchOrder(watchItems, data));
      setError(null);
    } catch {
      const fallback = getFallbackQuotes(symbols);
      setQuotes(mergeWithWatchOrder(watchItems, fallback));
      setError('行情网关不可用，当前显示演示/缓存数据');
    } finally {
      setIsLoading(false);
    }
  }, [symbols, watchItems]);

  useEffect(() => {
    void refresh();

    const timer = window.setInterval(refresh, refreshSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [refresh, refreshSeconds]);

  return { quotes, error, isLoading, refresh };
}

function mergeWithWatchOrder(watchItems: WatchItem[], quotes: Quote[]) {
  return watchItems.map((item) => {
    const quote = quotes.find((candidate) => candidate.symbol === item.symbol);
    return (
      quote ?? {
        symbol: item.symbol,
        market: item.market,
        type: item.type,
        name: item.name,
        price: null,
        changeAmount: null,
        changePercent: null,
        source: 'none',
        status: 'error' as const,
        updatedAt: '--',
      }
    );
  });
}
