import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Quote } from '../types/quote';
import type { WatchItem } from '../types/watchItem';
import { fetchQuotes } from '../api/quoteApi';

export function useQuotes(watchItems: WatchItem[], refreshSeconds: number) {
  const symbols = useMemo(() => watchItems.map((item) => `${item.market}.${item.symbol}`), [watchItems]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (symbols.length === 0) {
      setQuotes([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetchQuotes(symbols);
      if (requestId !== requestIdRef.current) return;
      setQuotes(mergeWithWatchOrder(watchItems, data));
      setError(null);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setQuotes(mergeWithWatchOrder(watchItems, []));
      setError('行情网关不可用，请稍后刷新');
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [symbols, watchItems]);

  useEffect(() => {
    void refresh();

    const timer = window.setInterval(refresh, refreshSeconds * 1000);
    function handleVisibilityChange() {
      if (!document.hidden) void refresh();
    }

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
