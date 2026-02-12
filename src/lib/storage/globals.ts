// Global variables system (persisted across all workspaces)
const GLOBALS_KEY = 'tinx_global_variables';

export interface GlobalVariable {
  key: string;
  value: string;
  type: 'default' | 'secret';
  enabled: boolean;
}

export const globalsService = {
  getAll(): GlobalVariable[] {
    const stored = localStorage.getItem(GLOBALS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  get(key: string): string | undefined {
    const all = this.getAll();
    const variable = all.find(v => v.key === key && v.enabled);
    return variable?.value;
  },

  set(key: string, value: string, type: 'default' | 'secret' = 'default') {
    const all = this.getAll();
    const index = all.findIndex(v => v.key === key);

    if (index !== -1) {
      all[index] = { ...all[index], value, type };
    } else {
      all.push({ key, value, type, enabled: true });
    }

    localStorage.setItem(GLOBALS_KEY, JSON.stringify(all));
  },

  delete(key: string) {
    const all = this.getAll();
    const filtered = all.filter(v => v.key !== key);
    localStorage.setItem(GLOBALS_KEY, JSON.stringify(filtered));
  },

  clear() {
    localStorage.removeItem(GLOBALS_KEY);
  },

  has(key: string): boolean {
    return this.get(key) !== undefined;
  },
};
