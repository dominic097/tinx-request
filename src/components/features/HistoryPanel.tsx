import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHistoryStore } from '@/stores/history';
import type { HistoryItem, Request } from '@/types';

interface HistoryPanelProps {
  onSelectHistoryItem: (request: Request) => void;
  onClose: () => void;
}

export function HistoryPanel({ onSelectHistoryItem, onClose }: HistoryPanelProps) {
  const { historyItems, fetchHistory, deleteHistoryItem, clearHistory, searchHistory } = useHistoryStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchHistory(query, 'url');
    } else {
      fetchHistory();
    }
  };

  const handleSelectItem = (item: HistoryItem) => {
    onSelectHistoryItem(item.request);
    onClose();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this history item?')) {
      deleteHistoryItem(id);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      clearHistory();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 300 && status < 400) return 'text-blue-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    if (status >= 500) return 'text-red-500';
    return 'text-gray-500';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-500';
      case 'POST': return 'text-yellow-500';
      case 'PUT': return 'text-blue-500';
      case 'PATCH': return 'text-purple-500';
      case 'DELETE': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[900px] h-[700px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Request History</h2>
          <div className="flex items-center gap-2">
            <Button onClick={handleClearAll} variant="outline" size="sm">
              Clear All
            </Button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <Input
            type="text"
            placeholder="Search by URL..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* History List */}
        <div className="flex-1 overflow-auto">
          {historyItems.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No history items yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-secondary cursor-pointer transition-colors"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Method and Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-mono font-semibold ${getMethodColor(item.request.method)}`}>
                          {item.request.method}
                        </span>
                        <span className={`text-xs font-mono ${getStatusColor(item.response.status)}`}>
                          {item.response.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.response.time}ms
                        </span>
                      </div>

                      {/* URL */}
                      <div className="text-sm font-mono truncate mb-1">
                        {item.request.url}
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="text-destructive hover:text-destructive/80 text-sm"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
