// Auto-sync system for GitHub and IndexedDB
import { GitHubService, loadGitHubConfig, getCollectionPath } from './githubIntegration';
import { collectionService, requestService } from './storage';
import type { Collection } from '@/types';

export interface SyncConfig {
  autoSyncEnabled: boolean;
  syncInterval: number; // in milliseconds
  lastSync: Date | null;
  conflictResolution: 'local' | 'remote' | 'manual';
}

const SYNC_CONFIG_KEY = 'tinx_auto_sync_config';
const DEFAULT_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export class AutoSyncManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private github: GitHubService | null = null;
  private config: SyncConfig;
  private isSyncing = false;
  private changeListeners: Set<() => void> = new Set();

  constructor() {
    this.config = this.loadConfig();
    this.initializeGitHub();
  }

  private loadConfig(): SyncConfig {
    const stored = localStorage.getItem(SYNC_CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      return {
        ...config,
        lastSync: config.lastSync ? new Date(config.lastSync) : null,
      };
    }
    return {
      autoSyncEnabled: false,
      syncInterval: DEFAULT_SYNC_INTERVAL,
      lastSync: null,
      conflictResolution: 'local',
    };
  }

  private saveConfig() {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(this.config));
  }

  private initializeGitHub() {
    const githubConfig = loadGitHubConfig();
    if (githubConfig) {
      this.github = new GitHubService(githubConfig);
    }
  }

  /**
   * Enable auto-sync
   */
  enable() {
    if (!this.github) {
      throw new Error('GitHub not configured. Please connect to GitHub first.');
    }

    this.config.autoSyncEnabled = true;
    this.saveConfig();
    this.startAutoSync();
    this.notifyListeners();
  }

  /**
   * Disable auto-sync
   */
  disable() {
    this.config.autoSyncEnabled = false;
    this.saveConfig();
    this.stopAutoSync();
    this.notifyListeners();
  }

  /**
   * Start auto-sync interval
   */
  private startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync immediately
    this.syncNow();

    // Then sync at intervals
    this.syncInterval = setInterval(() => {
      this.syncNow();
    }, this.config.syncInterval);
  }

  /**
   * Stop auto-sync interval
   */
  private stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync now (manual trigger)
   */
  async syncNow(): Promise<{ success: boolean; error?: string }> {
    if (this.isSyncing) {
      return { success: false, error: 'Sync already in progress' };
    }

    if (!this.github) {
      return { success: false, error: 'GitHub not configured' };
    }

    this.isSyncing = true;

    try {
      // Get all collections from IndexedDB
      const collections = await collectionService.getAll();
      
      // Sync each collection
      for (const collection of collections) {
        await this.syncCollection(collection);
      }

      this.config.lastSync = new Date();
      this.saveConfig();
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Auto-sync failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single collection
   */
  private async syncCollection(collection: Collection) {
    if (!this.github) return;

    try {
      // Get all requests for this collection
      const allRequests = await requestService.getAll();
      const collectionRequests = allRequests.filter(r => r.collectionId === collection.id);

      // Prepare data
      const data = {
        collection,
        requests: collectionRequests,
        syncedAt: new Date().toISOString(),
        version: '2.0',
      };

      const path = getCollectionPath(collection.id, collection.name);
      
      // Check if file exists on GitHub
      const existingFile = await this.github.getFile(path);

      if (existingFile) {
        // File exists - check for conflicts
        const remoteData = JSON.parse(existingFile.content);
        const remoteUpdated = new Date(remoteData.collection.updatedAt);
        const localUpdated = new Date(collection.updatedAt);

        if (remoteUpdated > localUpdated && this.config.conflictResolution === 'remote') {
          // Remote is newer, update local
          await this.updateLocalFromRemote(remoteData);
          return;
        }
      }

      // Push to GitHub
      await this.github.saveFile(
        {
          path,
          content: JSON.stringify(data, null, 2),
        },
        `Auto-sync: ${collection.name}`
      );
    } catch (error) {
      console.error(`Failed to sync collection ${collection.name}:`, error);
      throw error;
    }
  }

  /**
   * Update local collection from remote data
   */
  private async updateLocalFromRemote(remoteData: any) {
    try {
      // Update collection
      await collectionService.update(remoteData.collection.id, remoteData.collection);

      // Update requests
      for (const request of remoteData.requests) {
        const existing = await requestService.getById(request.id);
        if (existing) {
          await requestService.update(request.id, request);
        } else {
          // Create new request
          await requestService.create(
            request.name,
            request.method,
            request.url,
            request.collectionId
          );
        }
      }
    } catch (error) {
      console.error('Failed to update local from remote:', error);
      throw error;
    }
  }

  /**
   * Set sync interval
   */
  setSyncInterval(intervalMs: number) {
    this.config.syncInterval = intervalMs;
    this.saveConfig();
    
    if (this.config.autoSyncEnabled) {
      this.startAutoSync();
    }
    
    this.notifyListeners();
  }

  /**
   * Set conflict resolution strategy
   */
  setConflictResolution(strategy: 'local' | 'remote' | 'manual') {
    this.config.conflictResolution = strategy;
    this.saveConfig();
    this.notifyListeners();
  }

  /**
   * Get current config
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Check if syncing
   */
  isSyncingNow(): boolean {
    return this.isSyncing;
  }

  /**
   * Subscribe to config changes
   */
  subscribe(listener: () => void) {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.changeListeners.forEach(listener => listener());
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAutoSync();
    this.changeListeners.clear();
  }
}

// Singleton instance
export const autoSyncManager = new AutoSyncManager();

/**
 * IndexedDB change detector
 * Watches for changes and triggers auto-save
 */
export class IndexedDBWatcher {
  private observers: Map<string, MutationObserver> = new Set();
  private changeCallbacks: Set<(storeName: string) => void> = new Set();

  /**
   * Start watching for changes
   */
  start() {
    // Watch for storage events
    window.addEventListener('storage', this.handleStorageChange);
    
    // Watch for IndexedDB changes (via custom events)
    window.addEventListener('indexeddb-change', this.handleIndexedDBChange as EventListener);
  }

  /**
   * Stop watching
   */
  stop() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('indexeddb-change', this.handleIndexedDBChange as EventListener);
  }

  /**
   * Handle storage changes
   */
  private handleStorageChange = (event: StorageEvent) => {
    if (event.key?.startsWith('tinx_')) {
      this.notifyChange('localStorage');
    }
  };

  /**
   * Handle IndexedDB changes
   */
  private handleIndexedDBChange = (event: CustomEvent) => {
    this.notifyChange(event.detail.storeName);
  };

  /**
   * Subscribe to changes
   */
  onChange(callback: (storeName: string) => void) {
    this.changeCallbacks.add(callback);
    return () => {
      this.changeCallbacks.delete(callback);
    };
  }

  /**
   * Notify all callbacks
   */
  private notifyChange(storeName: string) {
    this.changeCallbacks.forEach(callback => callback(storeName));
  }
}

// Singleton instance
export const indexedDBWatcher = new IndexedDBWatcher();

/**
 * Initialize auto-sync system
 */
export function initializeAutoSync() {
  // Start watching for IndexedDB changes
  indexedDBWatcher.start();

  // Subscribe to changes and trigger sync
  indexedDBWatcher.onChange((storeName) => {
    if (autoSyncManager.getConfig().autoSyncEnabled) {
      // Debounce sync (wait 2 seconds after last change)
      debounceSync();
    }
  });

  // Check if auto-sync should be enabled on startup
  const config = autoSyncManager.getConfig();
  if (config.autoSyncEnabled) {
    try {
      autoSyncManager.enable();
    } catch (error) {
      console.error('Failed to enable auto-sync on startup:', error);
    }
  }
}

/**
 * Debounced sync function
 */
let syncTimeout: NodeJS.Timeout | null = null;
function debounceSync() {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(() => {
    autoSyncManager.syncNow();
  }, 2000); // Wait 2 seconds after last change
}

/**
 * Cleanup auto-sync system
 */
export function cleanupAutoSync() {
  autoSyncManager.destroy();
  indexedDBWatcher.stop();
}