export type Market = 'SH' | 'SZ' | 'BJ' | 'HK' | 'US' | 'FUND' | 'INDEX';

export type WatchItemType = 'stock' | 'fund' | 'etf' | 'index';

export type WatchItem = {
  id: string;
  symbol: string;
  market: Market;
  type: WatchItemType;
  name: string;
  sortOrder: number;
  createdAt: string;
};

export type SymbolSearchResult = Omit<WatchItem, 'id' | 'sortOrder' | 'createdAt'>;
