import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GitHubService, saveGitHubConfig, loadGitHubConfig, clearGitHubConfig } from '@/lib/githubIntegration';

export function GitHubAuth() {
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // Check if already connected on mount
  useState(() => {
    const config = loadGitHubConfig();
    if (config) {
      setToken(config.token);
      setOwner(config.owner);
      setRepo(config.repo);
      setBranch(config.branch || 'main');
      setIsConnected(true);
    }
  });

  const handleConnect = async () => {
    setError('');
    setIsVerifying(true);

    try {
      const config = { token, owner, repo, branch };
      const github = new GitHubService(config);
      
      const hasAccess = await github.verifyAccess();
      if (!hasAccess) {
        setError('Failed to verify GitHub access. Check your token and repository details.');
        setIsVerifying(false);
        return;
      }

      saveGitHubConfig(config);
      setIsConnected(true);
      setError('');
    } catch (err) {
      setError('Failed to connect to GitHub. Please check your credentials.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = () => {
    clearGitHubConfig();
    setToken('');
    setOwner('');
    setRepo('');
    setBranch('main');
    setIsConnected(false);
    setError('');
  };

  if (isConnected) {
    return (
      <div className="p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-green-500">✓ Connected to GitHub</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {owner}/{repo} ({branch})
            </p>
          </div>
          <Button onClick={handleDisconnect} variant="outline" size="sm">
            Disconnect
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Your collections will be automatically synced to your GitHub repository.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">Connect to GitHub</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Store your collections in a GitHub repository for backup and version control.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Personal Access Token
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=Tinx%20API%20Client"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-primary hover:underline"
            >
              (Generate Token)
            </a>
          </label>
          <Input
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Requires 'repo' scope for private repositories
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Repository Owner</label>
            <Input
              placeholder="username"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Repository Name</label>
            <Input
              placeholder="my-api-collections"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Branch (optional)</label>
          <Input
            placeholder="main"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={handleConnect}
          disabled={!token || !owner || !repo || isVerifying}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Connect to GitHub'}
        </Button>

        <div className="p-3 bg-secondary/50 rounded text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Privacy Note:</p>
          <p>
            Your GitHub token is stored locally in your browser and never sent to any third-party servers.
            All GitHub operations happen directly between your browser and GitHub's API.
          </p>
        </div>
      </div>
    </div>
  );
}