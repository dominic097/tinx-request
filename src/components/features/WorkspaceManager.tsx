import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/storage/db';
import type { Workspace } from '@/types';

interface WorkspaceManagerProps {
  onClose: () => void;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceManager({ onClose, onWorkspaceChange }: WorkspaceManagerProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    const data = await db.workspaces.toArray();
    setWorkspaces(data);
  };

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) return;

    const workspace: Workspace = {
      id: crypto.randomUUID(),
      name: newWorkspaceName.trim(),
      description: newWorkspaceDesc.trim() || undefined,
      isActive: workspaces.length === 0, // First workspace is active by default
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.workspaces.add(workspace);
    setNewWorkspaceName('');
    setNewWorkspaceDesc('');
    setIsCreating(false);
    loadWorkspaces();
  };

  const handleSetActive = async (id: string) => {
    // Deactivate all workspaces
    await Promise.all(
      workspaces.map(w => db.workspaces.update(w.id, { isActive: false }))
    );

    // Activate selected workspace
    await db.workspaces.update(id, { isActive: true });
    loadWorkspaces();

    if (onWorkspaceChange) {
      onWorkspaceChange(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this workspace? All collections and requests in it will remain but will need to be reassigned.')) {
      await db.workspaces.delete(id);
      loadWorkspaces();
    }
  };

  const activeWorkspace = workspaces.find(w => w.isActive);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[700px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Workspaces</h2>
            <p className="text-sm text-muted-foreground">
              Organize your API collections into workspaces
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Active Workspace */}
        {activeWorkspace && (
          <div className="p-4 bg-primary/5 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1">Active Workspace:</p>
            <p className="font-semibold">{activeWorkspace.name}</p>
            {activeWorkspace.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {activeWorkspace.description}
              </p>
            )}
          </div>
        )}

        {/* Create New */}
        <div className="p-4 border-b border-border">
          {isCreating ? (
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                autoFocus
              />
              <Input
                type="text"
                placeholder="Description (optional)"
                value={newWorkspaceDesc}
                onChange={(e) => setNewWorkspaceDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate}>Create</Button>
                <Button onClick={() => setIsCreating(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              + New Workspace
            </Button>
          )}
        </div>

        {/* Workspaces List */}
        <div className="flex-1 overflow-auto">
          {workspaces.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="mb-2">No workspaces yet</p>
                <p className="text-sm">Create your first workspace to get started</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{workspace.name}</h3>
                        {workspace.isActive && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      {workspace.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {workspace.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(workspace.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!workspace.isActive && (
                        <button
                          onClick={() => handleSetActive(workspace.id)}
                          className="text-sm text-primary hover:underline"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(workspace.id)}
                        className="text-sm text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
