import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollectionsStore } from '@/stores/collections';
import { useRequestsStore } from '@/stores/requests';
import type { Request } from '@/types';
import { HttpMethod } from '@/types';

interface CollectionsSidebarProps {
  onSelectRequest: (request: Request) => void;
  onNewRequest: () => void;
}

export function CollectionsSidebar({ onSelectRequest, onNewRequest }: CollectionsSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const {
    collections,
    fetchCollections,
    createCollection,
    deleteCollection,
    selectedCollectionId,
    selectCollection,
  } = useCollectionsStore();

  const { requests, fetchRequests } = useRequestsStore();

  useEffect(() => {
    fetchCollections();
    fetchRequests();
  }, [fetchCollections, fetchRequests]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      await createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleDeleteCollection = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this collection and all its requests?')) {
      await deleteCollection(id);
    }
  };

  const toggleCollection = (id: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCollections(newExpanded);
    selectCollection(id);
  };

  const getMethodColor = (method: HttpMethod) => {
    const colors: Record<HttpMethod, string> = {
      [HttpMethod.GET]: 'text-green-500',
      [HttpMethod.POST]: 'text-yellow-500',
      [HttpMethod.PUT]: 'text-blue-500',
      [HttpMethod.PATCH]: 'text-purple-500',
      [HttpMethod.DELETE]: 'text-red-500',
      [HttpMethod.HEAD]: 'text-gray-500',
      [HttpMethod.OPTIONS]: 'text-gray-500',
    };
    return colors[method] || 'text-gray-500';
  };

  const getCollectionRequests = (collectionId: string) => {
    return requests.filter(r => r.collectionId === collectionId);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm">Collections</h2>
        <div className="flex gap-1">
          <button
            onClick={onNewRequest}
            className="p-1 hover:bg-secondary rounded"
            title="New Request"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-secondary rounded"
            title="New Collection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Collection Input */}
      {isCreating && (
        <div className="p-2 border-b border-border">
          <div className="flex gap-1">
            <Input
              type="text"
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCollection();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              className="h-7 text-sm"
              autoFocus
            />
            <Button onClick={handleCreateCollection} size="sm" className="h-7 px-2">
              ✓
            </Button>
            <Button onClick={() => setIsCreating(false)} size="sm" variant="outline" className="h-7 px-2">
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Collections List */}
      <div className="flex-1 overflow-auto">
        {collections.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <p>No collections yet</p>
            <p className="text-xs mt-1">Create one to organize your requests</p>
          </div>
        ) : (
          <div className="py-1">
            {collections.map((collection) => {
              const isExpanded = expandedCollections.has(collection.id);
              const collectionRequests = getCollectionRequests(collection.id);
              
              return (
                <div key={collection.id} className="mb-1">
                  {/* Collection Header */}
                  <div
                    className={`flex items-center justify-between px-2 py-1.5 hover:bg-secondary cursor-pointer group ${
                      selectedCollectionId === collection.id ? 'bg-secondary' : ''
                    }`}
                    onClick={() => toggleCollection(collection.id)}
                  >
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <svg
                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-sm truncate">{collection.name}</span>
                      <span className="text-xs text-muted-foreground">({collectionRequests.length})</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteCollection(collection.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-destructive"
                      title="Delete collection"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Collection Requests */}
                  {isExpanded && (
                    <div className="ml-4">
                      {collectionRequests.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          No requests
                        </div>
                      ) : (
                        collectionRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-secondary cursor-pointer group"
                            onClick={() => onSelectRequest(request)}
                          >
                            <span className={`text-xs font-semibold w-12 ${getMethodColor(request.method)}`}>
                              {request.method}
                            </span>
                            <span className="text-sm truncate flex-1">{request.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}