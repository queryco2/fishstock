import type { Market, WatchItemType } from './watchItem';

export type QuoteStatus = 'normal' | 'delay' | 'closed' | 'error';

export type Quote = {
  symbol: string;
  market: Market;
  type: WatchItemType;
  name: string;
  price: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  volume?: number | null;
  amount?: number | null;
  source: string;
  status: QuoteStatus;
  updatedAt: string;
  cached?: boolean;
};

export type DisplayMode =
  | 'excel'
  | 'weather'
  | 'calendar'
  | 'ledger'
  | 'project'
  | 'mail'
  | 'logistics'
  | 'monitor';

export type DisplayColumn = {
  field: string;
  headerName: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
};

export type DisplayRow = Record<string, string | number | null | undefined>;
