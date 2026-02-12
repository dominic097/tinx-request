import { create } from 'zustand';
import { Environment } from '@/types';
import { environmentService } from '@/lib/storage';

interface EnvironmentsState {
  environments: Environment[];
  activeEnvironment: Environment | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEnvironments: () => Promise<void>;
  createEnvironment: (name: string) => Promise<Environment>;
  updateEnvironment: (id: string, updates: Partial<Environment>) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  setActiveEnvironment: (id: string) => Promise<void>;
}

export const useEnvironmentsStore = create<EnvironmentsState>((set, get) => ({
  environments: [],
  activeEnvironment: null,
  isLoading: false,
  error: null,

  fetchEnvironments: async () => {
    set({ isLoading: true, error: null });
    try {
      const environments = await environmentService.getAll();
      const active = await environmentService.getActive();
      set({ environments, activeEnvironment: active || null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createEnvironment: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const environment = await environmentService.create(name);
      set(state => ({
        environments: [...state.environments, environment],
        isLoading: false,
      }));
      return environment;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateEnvironment: async (id: string, updates: Partial<Environment>) => {
    set({ isLoading: true, error: null });
    try {
      await environmentService.update(id, updates);
      set(state => ({
        environments: state.environments.map(e =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
        ),
        activeEnvironment:
          state.activeEnvironment?.id === id
            ? { ...state.activeEnvironment, ...updates, updatedAt: new Date() }
            : state.activeEnvironment,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteEnvironment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await environmentService.delete(id);
      set(state => ({
        environments: state.environments.filter(e => e.id !== id),
        activeEnvironment:
          state.activeEnvironment?.id === id ? null : state.activeEnvironment,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setActiveEnvironment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await environmentService.setActive(id);
      const environment = await environmentService.getById(id);
      set({ activeEnvironment: environment || null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
