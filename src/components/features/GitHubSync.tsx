import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GitHubService, loadGitHubConfig, getCollectionPath } from '@/lib/githubIntegration';
import { useCollectionsStore } from '@/stores/collections';
import { useRequestsStore } from '@/stores/requests';
import type { Collection } from '@/types';

export function GitHubSync() {
  const { collections } = useCollectionsStore();
  const { requests } = useRequestsStore();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [github, setGithub] = useState<GitHubService | null>(null);

  useEffect(() => {
    const config = loadGitHubConfig();
    if (config) {
      setGithub(new GitHubService(config));
      const stored = localStorage.getItem('tinx_last_github_sync');
      if (stored) {
        setLastSync(new Date(stored));
      }
    }
  }, []);

  const handlePush = async () => {
    if (!github) return;

    setSyncing(true);
    setError('');

    try {
      // Push each collection
      for (const collection of collections) {
        const collectionRequests = requests.filter(r => r.collectionId === collection.id);
        
        const data = {
          collection,
          requests: collectionRequests,
          exportedAt: new Date().toISOString(),
        };

        const path = getCollectionPath(collection.id, collection.name);
        await github.saveFile(
          {
            path,
            content: JSON.stringify(data, null, 2),
          },
          `Update collection: ${collection.name}`
        );
      }

      const now = new Date();
      setLastSync(now);
      localStorage.setItem('tinx_last_github_sync', now.toISOString());
    } catch (err) {
      setError('Failed to push collections to GitHub');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handlePull = async () => {
    if (!github) return;

    setSyncing(true);
    setError('');

    try {
      const files = await github.listFiles('tinx-collections');
      
      // TODO: Implement pull logic to import collections from GitHub
      console.log('Files found:', files);
      
      setError('Pull functionality coming soon!');
    } catch (err) {
      setError('Failed to pull collections from GitHub');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  if (!github) {
    return null;
  }

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">GitHub Sync</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {collections.length} collection(s) ready to sync
          </p>
          {lastSync && (
            <p className="text-xs text-muted-foreground mt-1">
              Last synced: {lastSync.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handlePush}
          disabled={syncing || collections.length === 0}
          className="flex-1"
        >
          {syncing ? 'Syncing...' : '↑ Push to GitHub'}
        </Button>
        <Button
          onClick={handlePull}
          disabled={syncing}
          variant="outline"
          className="flex-1"
        >
          {syncing ? 'Syncing...' : '↓ Pull from GitHub'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Push: Upload your local collections to GitHub<br />
        Pull: Download collections from GitHub (overwrites local)
      </p>
    </div>
  );
}