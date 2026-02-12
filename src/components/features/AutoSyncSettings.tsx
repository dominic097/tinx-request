import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { autoSyncManager } from '@/lib/autoSync';
import type { SyncConfig } from '@/lib/autoSync';

export function AutoSyncSettings() {
  const [config, setConfig] = useState<SyncConfig>(autoSyncManager.getConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Subscribe to config changes
    const unsubscribe = autoSyncManager.subscribe(() => {
      setConfig(autoSyncManager.getConfig());
      setIsSyncing(autoSyncManager.isSyncingNow());
    });

    return unsubscribe;
  }, []);

  const handleToggleAutoSync = async () => {
    try {
      if (config.autoSyncEnabled) {
        autoSyncManager.disable();
      } else {
        autoSyncManager.enable();
      }
      setLastSyncStatus('success');
      setErrorMessage('');
    } catch (error) {
      setLastSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to toggle auto-sync');
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    const result = await autoSyncManager.syncNow();
    setIsSyncing(false);
    
    if (result.success) {
      setLastSyncStatus('success');
      setErrorMessage('');
    } else {
      setLastSyncStatus('error');
      setErrorMessage(result.error || 'Sync failed');
    }
  };

  const handleIntervalChange = (minutes: number) => {
    autoSyncManager.setSyncInterval(minutes * 60 * 1000);
  };

  const handleConflictResolutionChange = (strategy: 'local' | 'remote' | 'manual') => {
    autoSyncManager.setConflictResolution(strategy);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold">Auto-Sync</h4>
            <p className="text-sm text-muted-foreground">
              Automatically sync changes to GitHub and IndexedDB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {config.autoSyncEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={handleToggleAutoSync}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autoSyncEnabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {config.autoSyncEnabled && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sync Interval
              </label>
              <select
                value={config.syncInterval / 60000}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm"
              >
                <option value={1}>Every 1 minute</option>
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every hour</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Conflict Resolution
              </label>
              <select
                value={config.conflictResolution}
                onChange={(e) => handleConflictResolutionChange(e.target.value as any)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm"
              >
                <option value="local">Prefer Local Changes</option>
                <option value="remote">Prefer Remote Changes</option>
                <option value="manual">Manual Resolution</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {config.conflictResolution === 'local' && 'Local changes will overwrite remote'}
                {config.conflictResolution === 'remote' && 'Remote changes will overwrite local'}
                {config.conflictResolution === 'manual' && 'You will be prompted to resolve conflicts'}
              </p>
            </div>

            {config.lastSync && (
              <div className="text-sm text-muted-foreground">
                Last synced: {new Date(config.lastSync).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-card rounded-lg border border-border">
        <h4 className="font-semibold mb-2">Manual Sync</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Sync your collections immediately
        </p>
        
        <Button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>

        {lastSyncStatus === 'success' && (
          <div className="mt-3 p-2 bg-green-500/10 border border-green-500 rounded text-sm text-green-500">
            ✓ Sync successful
          </div>
        )}

        {lastSyncStatus === 'error' && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
            ✕ {errorMessage}
          </div>
        )}
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg border border-border">
        <h4 className="font-semibold mb-2">How Auto-Sync Works</h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• <strong>IndexedDB Auto-Save</strong>: Changes are automatically saved to local IndexedDB</li>
          <li>• <strong>GitHub Auto-Sync</strong>: When enabled, changes sync to GitHub at set intervals</li>
          <li>• <strong>Offline Support</strong>: Works offline, syncs when connection is restored</li>
          <li>• <strong>Conflict Resolution</strong>: Choose how to handle conflicts between local and remote</li>
          <li>• <strong>No Data Loss</strong>: Dual storage (IndexedDB + GitHub) prevents data loss</li>
        </ul>
      </div>

      <div className="p-4 bg-yellow-500/10 border border-yellow-500 rounded">
        <h4 className="font-semibold text-yellow-600 mb-2">⚠️ Important Notes</h4>
        <ul className="text-sm text-yellow-600 space-y-1">
          <li>• Auto-sync requires GitHub connection</li>
          <li>• Frequent syncs may hit GitHub API rate limits</li>
          <li>• Large collections may take longer to sync</li>
          <li>• Always backup important data</li>
        </ul>
      </div>
    </div>
  );
}