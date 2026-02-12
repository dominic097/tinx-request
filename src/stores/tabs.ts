import { create } from 'zustand';
import type { Request } from '@/types';

export interface RequestTab {
  id: string;
  request: Partial<Request> & {
    id?: string;
    name: string;
    method: string;
    url: string;
  };
  isDirty: boolean;
}

interface TabsState {
  tabs: RequestTab[];
  activeTabId: string | null;

  // Actions
  openTab: (request: Partial<Request> & { name: string; method: string; url: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<RequestTab['request']>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  markDirty: (tabId: string, isDirty: boolean) => void;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (request) => {
    const { tabs } = get();

    // Check if tab already exists
    const existingTab = tabs.find(t => t.request.id === request.id);
    if (existingTab) {
      set({ activeTabId: existingTab.id });
      return;
    }

    // Create new tab
    const newTab: RequestTab = {
      id: request.id || crypto.randomUUID(),
      request,
      isDirty: false,
    };

    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    });
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const index = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);

    let newActiveId = activeTabId;
    if (activeTabId === tabId) {
      // If closing active tab, activate adjacent tab
      if (newTabs.length > 0) {
        newActiveId = newTabs[Math.min(index, newTabs.length - 1)].id;
      } else {
        newActiveId = null;
      }
    }

    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId });
  },

  updateTab: (tabId, updates) => {
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, request: { ...tab.request, ...updates }, isDirty: true }
          : tab
      ),
    }));
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null });
  },

  closeOtherTabs: (tabId) => {
    const { tabs } = get();
    const keepTab = tabs.find(t => t.id === tabId);
    if (keepTab) {
      set({ tabs: [keepTab], activeTabId: keepTab.id });
    }
  },

  markDirty: (tabId, isDirty) => {
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId ? { ...tab, isDirty } : tab
      ),
    }));
  },
}));
