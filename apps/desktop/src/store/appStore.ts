import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type { DisplayMode } from '../types/quote';
import type { SymbolSearchResult, WatchItem } from '../types/watchItem';
import { defaultWatchItems } from '../api/mockData';

type AppState = {
  mode: DisplayMode;
  isSuperDisguise: boolean;
  isMiniMode: boolean;
  watchItems: WatchItem[];
  refreshSeconds: number;
  setMode: (mode: DisplayMode) => void;
  toggleSuperDisguise: () => void;
  toggleMiniMode: () => void;
  setSuperDisguise: (value: boolean) => void;
  addWatchItem: (item: SymbolSearchResult) => void;
  removeWatchItem: (id: string) => void;
  setRefreshSeconds: (seconds: number) => void;
};

type PersistedAppState = Pick<AppState, 'mode' | 'isSuperDisguise' | 'isMiniMode' | 'watchItems' | 'refreshSeconds'>;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: 'excel',
      isSuperDisguise: false,
      isMiniMode: true,
      watchItems: defaultWatchItems,
      refreshSeconds: 5,
      setMode: (mode) => set({ mode }),
      toggleSuperDisguise: () => set((state) => ({ isSuperDisguise: !state.isSuperDisguise })),
      toggleMiniMode: () => set((state) => ({ isMiniMode: !state.isMiniMode })),
      setSuperDisguise: (value) => set({ isSuperDisguise: value }),
      addWatchItem: (item) =>
        set((state) => {
          if (state.watchItems.some((watchItem) => watchItem.symbol === item.symbol && watchItem.market === item.market)) {
            return state;
          }

          return {
            watchItems: [
              ...state.watchItems,
              {
                ...item,
                id: `watch_${item.market}_${item.symbol}_${Date.now()}`,
                sortOrder: state.watchItems.length + 1,
                createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              },
            ],
          };
        }),
      removeWatchItem: (id) =>
        set((state) => ({
          watchItems: state.watchItems.filter((item) => item.id !== id),
        })),
      setRefreshSeconds: (seconds) => set({ refreshSeconds: seconds }),
    }),
    {
      name: 'fishstock-app-state',
      version: 1,
      migrate: (persistedState, version): PersistedAppState => {
        const state = {
          mode: 'excel',
          isSuperDisguise: false,
          isMiniMode: true,
          watchItems: defaultWatchItems,
          refreshSeconds: 5,
          ...(persistedState && typeof persistedState === 'object' ? (persistedState as Partial<PersistedAppState>) : {}),
        } satisfies PersistedAppState;

        if (version === 0 && persistedState && typeof persistedState === 'object') {
          if (state.refreshSeconds === 10) {
            return { ...state, refreshSeconds: 5 };
          }
        }

        return state;
      },
      partialize: (state) => ({
        mode: state.mode,
        isSuperDisguise: state.isSuperDisguise,
        isMiniMode: state.isMiniMode,
        watchItems: state.watchItems,
        refreshSeconds: state.refreshSeconds,
      }),
    },
  ),
);
