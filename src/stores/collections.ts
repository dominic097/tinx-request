import { create } from 'zustand';
import type { Collection } from '@/types';
import { collectionService } from '@/lib/storage';

interface CollectionsState {
  collections: Collection[];
  selectedCollectionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCollections: () => Promise<void>;
  createCollection: (name: string, description?: string) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  selectCollection: (id: string | null) => void;
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  selectedCollectionId: null,
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const collections = await collectionService.getAll();
      set({ collections, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createCollection: async (name: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const collection = await collectionService.create(name, description);
      set(state => ({
        collections: [...state.collections, collection],
        isLoading: false,
      }));
      return collection;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateCollection: async (id: string, updates: Partial<Collection>) => {
    set({ isLoading: true, error: null });
    try {
      await collectionService.update(id, updates);
      set(state => ({
        collections: state.collections.map(c =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteCollection: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await collectionService.delete(id);
      set(state => ({
        collections: state.collections.filter(c => c.id !== id),
        selectedCollectionId:
          state.selectedCollectionId === id ? null : state.selectedCollectionId,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectCollection: (id: string | null) => {
    set({ selectedCollectionId: id });
  },
}));
