// GitHub integration for storing collections

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

export interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
}

const GITHUB_API = 'https://api.github.com';

export class GitHubService {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = {
      ...config,
      branch: config.branch || 'main',
    };
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get file from GitHub repository
   */
  async getFile(path: string): Promise<GitHubFile | null> {
    try {
      const url = `${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = atob(data.content); // Decode base64

      return {
        path: data.path,
        content,
        sha: data.sha,
      };
    } catch (error) {
      console.error('Failed to get file from GitHub:', error);
      throw error;
    }
  }

  /**
   * Create or update file in GitHub repository
   */
  async saveFile(file: GitHubFile, message: string): Promise<void> {
    try {
      // Check if file exists to get SHA
      const existing = await this.getFile(file.path);
      
      const url = `${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}/contents/${file.path}`;
      const content = btoa(file.content); // Encode to base64

      const body: any = {
        message,
        content,
        branch: this.config.branch,
      };

      if (existing?.sha) {
        body.sha = existing.sha;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to save file to GitHub:', error);
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string = ''): Promise<Array<{ name: string; path: string; type: string }>> {
    try {
      const url = `${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
      })) : [];
    } catch (error) {
      console.error('Failed to list files from GitHub:', error);
      throw error;
    }
  }

  /**
   * Delete file from repository
   */
  async deleteFile(path: string, message: string): Promise<void> {
    try {
      const existing = await this.getFile(path);
      if (!existing) {
        throw new Error('File not found');
      }

      const url = `${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message,
          sha: existing.sha,
          branch: this.config.branch,
        }),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete file from GitHub:', error);
      throw error;
    }
  }

  /**
   * Verify GitHub token and repository access
   */
  async verifyAccess(): Promise<boolean> {
    try {
      const url = `${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Save GitHub configuration
 */
export function saveGitHubConfig(config: GitHubConfig): void {
  localStorage.setItem('tinx_github_config', JSON.stringify(config));
}

/**
 * Load GitHub configuration
 */
export function loadGitHubConfig(): GitHubConfig | null {
  const stored = localStorage.getItem('tinx_github_config');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Clear GitHub configuration
 */
export function clearGitHubConfig(): void {
  localStorage.removeItem('tinx_github_config');
}

/**
 * Generate collection file path
 */
export function getCollectionPath(collectionId: string, collectionName: string): string {
  const sanitized = collectionName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `tinx-collections/${sanitized}_${collectionId}.json`;
}