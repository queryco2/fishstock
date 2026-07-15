import type { Quote } from '../types/quote';
import type { SymbolSearchResult } from '../types/watchItem';
import { getMockQuotes, searchableSymbols } from './mockData';
import { invoke } from '@tauri-apps/api/core';

const API_BASE = import.meta.env.VITE_QUOTE_API_BASE ?? 'http://127.0.0.1:8787';

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];

  if (isTauriRuntime()) {
    return invoke<Quote[]>('fetch_quotes', { symbols });
  }

  const query = encodeURIComponent(symbols.join(','));
  const response = await fetch(`${API_BASE}/api/quotes?symbols=${query}&_=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error('quote request failed');
  }

  return response.json();
}

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function searchSymbols(keyword: string): Promise<SymbolSearchResult[]> {
  const trimmed = keyword.trim();
  if (!trimmed) return searchableSymbols.slice(0, 6);

  if (isTauriRuntime()) {
    try {
      const data = await invoke<SymbolSearchResult[]>('search_symbols', { keyword: trimmed });
      if (data.length > 0) return data;
    } catch {
      return localSearchSymbols(trimmed);
    }
  }

  try {
    const response = await fetch(`${API_BASE}/api/symbols/search?keyword=${encodeURIComponent(trimmed)}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Local search keeps the tool usable before the gateway is started.
  }

  return localSearchSymbols(trimmed);
}

export function getFallbackQuotes(symbols: string[]) {
  return getMockQuotes(symbols);
}

function localSearchSymbols(keyword: string) {
  return searchableSymbols
    .filter((item) => item.symbol.includes(keyword) || item.name.toLowerCase().includes(keyword.toLowerCase()))
    .slice(0, 8);
}
