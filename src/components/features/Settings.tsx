import { useState } from 'react';
import { GitHubAuth } from './GitHubAuth';
import { GitHubSync } from './GitHubSync';
import { AutoSyncSettings } from './AutoSyncSettings';
import { EnhancedImportExport } from './EnhancedImportExport';

type SettingsTab = 'general' | 'github' | 'importexport' | 'about';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-border p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                activeTab === 'general'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                activeTab === 'github'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              GitHub Integration
            </button>
            <button
              onClick={() => setActiveTab('importexport')}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                activeTab === 'importexport'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              Import/Export
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                activeTab === 'about'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">General Settings</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Application</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure general application settings
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Theme</label>
                        <select className="px-3 py-2 bg-secondary border border-border rounded text-sm">
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Request Timeout (ms)</label>
                        <input 
                          type="number" 
                          defaultValue={30000}
                          className="w-32 px-3 py-2 bg-secondary border border-border rounded text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Auto-save Requests</label>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-card rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Storage</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage local storage and data
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Clear Cache</p>
                          <p className="text-xs text-muted-foreground">Remove temporary data</p>
                        </div>
                        <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm">
                          Clear
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Reset Application</p>
                          <p className="text-xs text-muted-foreground">Clear all data (cannot be undone)</p>
                        </div>
                        <button className="px-4 py-2 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded text-sm">
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">GitHub Integration</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Connect to GitHub to backup and sync your collections across devices
                </p>
              </div>

              <GitHubAuth />
              <GitHubSync />
              <AutoSyncSettings />

              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">How it works</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Your collections are stored as JSON files in your repository</li>
                  <li>• All communication happens directly with GitHub (no intermediaries)</li>
                  <li>• Your token is stored locally and never shared</li>
                  <li>• Perfect for version control and team collaboration</li>
                  <li>• Works with both public and private repositories</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'importexport' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Import & Export</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Transfer collections between Tinx and other API clients
                </p>
              </div>

              <EnhancedImportExport />

              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Supported Formats</h4>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Export</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ Postman Collection v2.1</li>
                      <li>✅ Tinx Native Format</li>
                      <li>🔜 OpenAPI 3.0</li>
                      <li>🔜 Insomnia</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Import</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ Postman Collection</li>
                      <li>✅ Tinx Format</li>
                      <li>🔜 OpenAPI 3.0</li>
                      <li>🔜 Insomnia</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">About Tinx</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Privacy-first API testing client
                </p>
              </div>

              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Version</p>
                    <p className="text-lg font-bold">2.0.0</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Features</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ Multiple Request Tabs</li>
                      <li>✅ 95+ Dynamic Variables</li>
                      <li>✅ Nested Folders</li>
                      <li>✅ Script Console</li>
                      <li>✅ Pre-request & Test Scripts</li>
                      <li>✅ pm.sendRequest() - Request Chaining</li>
                      <li>✅ pm.cookies - Cookie Management</li>
                      <li>✅ Form-Data with File Uploads</li>
                      <li>✅ Data-Driven Testing (CSV/JSON)</li>
                      <li>✅ GitHub Integration</li>
                      <li>✅ Import/Export (Multiple Formats)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Privacy & Security</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ 100% Local - No cloud storage</li>
                      <li>✅ No tracking or analytics</li>
                      <li>✅ Data never leaves your machine</li>
                      <li>✅ Open source</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Technology Stack</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      React 18 • TypeScript • Vite • IndexedDB • Zustand • Tailwind CSS
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      MIT License • Made with ❤️ for developers
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Documentation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn more about features and how to use them
                </p>
                <div className="space-y-2">
                  <a 
                    href="#" 
                    className="block text-sm text-primary hover:underline"
                  >
                    📚 User Guide
                  </a>
                  <a 
                    href="#" 
                    className="block text-sm text-primary hover:underline"
                  >
                    🚀 New Features Guide
                  </a>
                  <a 
                    href="#" 
                    className="block text-sm text-primary hover:underline"
                  >
                    🐛 Report an Issue
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}