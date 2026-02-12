import { create } from 'zustand';
import type { HistoryItem, Request, Response } from '@/types';
import { historyService } from '@/lib/storage';

interface HistoryState {
  historyItems: HistoryItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHistory: (limit?: number) => Promise<void>;
  addToHistory: (request: Request, response: Response) => Promise<HistoryItem>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  searchHistory: (query: string, type: 'url' | 'method') => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  historyItems: [],
  isLoading: false,
  error: null,

  fetchHistory: async (limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const items = await historyService.getRecent(limit);
      set({ historyItems: items, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addToHistory: async (request: Request, response: Response) => {
    set({ isLoading: true, error: null });
    try {
      const item = await historyService.add(request, response);
      set(state => ({
        historyItems: [item, ...state.historyItems],
        isLoading: false,
      }));
      return item;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteHistoryItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await historyService.delete(id);
      set(state => ({
        historyItems: state.historyItems.filter(item => item.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      await historyService.deleteAll();
      set({ historyItems: [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  searchHistory: async (query: string, type: 'url' | 'method') => {
    set({ isLoading: true, error: null });
    try {
      const items = type === 'url'
        ? await historyService.searchByUrl(query)
        : await historyService.searchByMethod(query);
      set({ historyItems: items, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
