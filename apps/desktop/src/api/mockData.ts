import dayjs from 'dayjs';
import type { Quote } from '../types/quote';
import type { SymbolSearchResult, WatchItem } from '../types/watchItem';

export const defaultWatchItems: WatchItem[] = [
  {
    id: 'watch_600519',
    symbol: '600519',
    market: 'SH',
    type: 'stock',
    name: '贵州茅台',
    sortOrder: 1,
    createdAt: '2026-06-14 15:30:00',
  },
  {
    id: 'watch_300750',
    symbol: '300750',
    market: 'SZ',
    type: 'stock',
    name: '宁德时代',
    sortOrder: 2,
    createdAt: '2026-06-14 15:30:00',
  },
  {
    id: 'watch_510300',
    symbol: '510300',
    market: 'SH',
    type: 'etf',
    name: '沪深300ETF',
    sortOrder: 3,
    createdAt: '2026-06-14 15:30:00',
  },
];

export const searchableSymbols: SymbolSearchResult[] = [
  { symbol: '600519', market: 'SH', type: 'stock', name: '贵州茅台' },
  { symbol: '300750', market: 'SZ', type: 'stock', name: '宁德时代' },
  { symbol: '000001', market: 'SZ', type: 'stock', name: '平安银行' },
  { symbol: '601318', market: 'SH', type: 'stock', name: '中国平安' },
  { symbol: '600036', market: 'SH', type: 'stock', name: '招商银行' },
  { symbol: '510300', market: 'SH', type: 'etf', name: '沪深300ETF' },
  { symbol: '159915', market: 'SZ', type: 'etf', name: '创业板ETF' },
  { symbol: '000300', market: 'INDEX', type: 'index', name: '沪深300' },
  { symbol: '00700', market: 'HK', type: 'stock', name: '腾讯控股' },
  { symbol: '03690', market: 'HK', type: 'stock', name: '美团-W' },
  { symbol: '09988', market: 'HK', type: 'stock', name: '阿里巴巴-W' },
];

export function getMockQuotes(symbols: string[]): Quote[] {
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
  return symbols.map((fullSymbol, index) => {
    const marketHint = fullSymbol.includes('.') ? fullSymbol.split('.')[0] : undefined;
    const symbol = fullSymbol.split('.').at(-1) ?? fullSymbol;
    const base = searchableSymbols.find((item) => item.symbol === symbol) ?? {
      symbol,
      market: detectMarket(symbol, marketHint),
      type: 'stock' as const,
      name: `演示标的 ${symbol}`,
    };
    const seed = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const drift = Math.sin(Date.now() / 20000 + index) * 0.8;
    const price = Number(((seed % 900) + 20 + drift).toFixed(2));
    const changePercent = Number(((seed % 13) - 6 + drift).toFixed(2));

    return {
      ...base,
      price,
      changeAmount: Number((price * changePercent / 100).toFixed(2)),
      changePercent,
      source: 'demo',
      status: 'delay',
      updatedAt: now,
      cached: true,
    };
  });
}

function detectMarket(symbol: string, marketHint?: string): SymbolSearchResult['market'] {
  if (marketHint === 'HK') return 'HK';
  if (/^\d{5}$/.test(symbol)) return 'HK';
  if (symbol.startsWith('6')) return 'SH';
  if (symbol.startsWith('0') || symbol.startsWith('3') || symbol.startsWith('1')) return 'SZ';
  if (symbol.startsWith('8') || symbol.startsWith('4')) return 'BJ';
  return 'INDEX';
}
