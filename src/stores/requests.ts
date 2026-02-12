import { create } from 'zustand';
import { Request, HttpMethod } from '@/types';
import { requestService } from '@/lib/storage';

interface RequestsState {
  requests: Request[];
  openTabs: Request[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRequests: () => Promise<void>;
  createRequest: (name: string, method: HttpMethod, url: string, collectionId?: string) => Promise<Request>;
  updateRequest: (id: string, updates: Partial<Request>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  duplicateRequest: (id: string) => Promise<Request>;
  openTab: (request: Request) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useRequestsStore = create<RequestsState>((set, get) => ({
  requests: [],
  openTabs: [],
  activeTabId: null,
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const requests = await requestService.getAll();
      set({ requests, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createRequest: async (name: string, method: HttpMethod, url: string, collectionId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const request = await requestService.create(name, method, url, collectionId);
      set(state => ({
        requests: [...state.requests, request],
        isLoading: false,
      }));
      return request;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateRequest: async (id: string, updates: Partial<Request>) => {
    set({ isLoading: true, error: null });
    try {
      await requestService.update(id, updates);
      set(state => ({
        requests: state.requests.map(r =>
          r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
        ),
        openTabs: state.openTabs.map(r =>
          r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteRequest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await requestService.delete(id);
      set(state => ({
        requests: state.requests.filter(r => r.id !== id),
        openTabs: state.openTabs.filter(r => r.id !== id),
        activeTabId: state.activeTabId === id ? state.openTabs[0]?.id || null : state.activeTabId,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  duplicateRequest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const duplicate = await requestService.duplicate(id);
      set(state => ({
        requests: [...state.requests, duplicate],
        isLoading: false,
      }));
      return duplicate;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  openTab: (request: Request) => {
    set(state => {
      const existing = state.openTabs.find(t => t.id === request.id);
      if (existing) {
        return { activeTabId: request.id };
      }
      return {
        openTabs: [...state.openTabs, request],
        activeTabId: request.id,
      };
    });
  },

  closeTab: (id: string) => {
    set(state => {
      const newTabs = state.openTabs.filter(t => t.id !== id);
      const newActiveId = state.activeTabId === id
        ? newTabs[newTabs.length - 1]?.id || null
        : state.activeTabId;
      return {
        openTabs: newTabs,
        activeTabId: newActiveId,
      };
    });
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id });
  },
}));
