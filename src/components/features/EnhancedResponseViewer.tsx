import { useState } from 'react';
import type { Response } from '@/types';

interface EnhancedResponseViewerProps {
  response: Response | null;
  isLoading: boolean;
}

export function EnhancedResponseViewer({ response, isLoading }: EnhancedResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'pretty' | 'raw' | 'preview' | 'headers'>('pretty');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 300 && status < 400) return 'text-blue-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    if (status >= 500) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isJSON = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const isXML = (str: string) => {
    return str.trim().startsWith('<');
  };

  const isHTML = (str: string) => {
    return str.trim().toLowerCase().startsWith('<!doctype html') ||
           str.trim().toLowerCase().startsWith('<html');
  };

  const toggleCollapse = (path: string) => {
    const newSet = new Set(collapsedPaths);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setCollapsedPaths(newSet);
  };

  const renderJSONValue = (value: any, path: string = '', level: number = 0): JSX.Element => {
    const indent = level * 20;

    if (value === null) {
      return <span className="text-purple-500">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-500">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-orange-500">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const isCollapsed = collapsedPaths.has(path);
      return (
        <div>
          <span
            onClick={() => toggleCollapse(path)}
            className="cursor-pointer hover:bg-secondary px-1 rounded"
          >
            <span className="text-muted-foreground">{isCollapsed ? '▶' : '▼'}</span>
            <span className="text-muted-foreground"> Array[{value.length}]</span>
          </span>
          {!isCollapsed && (
            <div style={{ marginLeft: `${indent + 20}px` }}>
              {value.map((item, index) => (
                <div key={index} className="py-0.5">
                  <span className="text-muted-foreground mr-2">{index}:</span>
                  {renderJSONValue(item, `${path}[${index}]`, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const isCollapsed = collapsedPaths.has(path);
      return (
        <div>
          <span
            onClick={() => toggleCollapse(path)}
            className="cursor-pointer hover:bg-secondary px-1 rounded"
          >
            <span className="text-muted-foreground">{isCollapsed ? '▶' : '▼'}</span>
            <span className="text-muted-foreground"> Object{'{'}...{'}'}</span>
          </span>
          {!isCollapsed && (
            <div style={{ marginLeft: `${indent + 20}px` }}>
              {keys.map((key) => (
                <div key={key} className="py-0.5">
                  <span className="text-blue-400">{key}</span>
                  <span className="text-muted-foreground">: </span>
                  {renderJSONValue(value[key], `${path}.${key}`, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Sending request...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Send a request to see the response</p>
      </div>
    );
  }

  const bodyIsJSON = isJSON(response.body);
  const bodyIsXML = isXML(response.body);
  const bodyIsHTML = isHTML(response.body);

  return (
    <div className="flex flex-col h-full">
      {/* Status Bar */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/30">
        <div className="flex items-center gap-4">
          <span className={`font-semibold ${getStatusColor(response.status)}`}>
            {response.status} {response.statusText}
          </span>
          <span className="text-sm text-muted-foreground">{response.time}ms</span>
          <span className="text-sm text-muted-foreground">{formatSize(response.size)}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search in response..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2 py-1 text-sm bg-secondary border border-border rounded"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4 px-4">
          <button
            onClick={() => setActiveTab('pretty')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'pretty'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pretty
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'raw'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Raw
          </button>
          {(bodyIsHTML || bodyIsXML) && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
          )}
          <button
            onClick={() => setActiveTab('headers')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'headers'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Headers ({Object.keys(response.headers).length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'pretty' && bodyIsJSON ? (
          <div className="font-mono text-sm">
            {renderJSONValue(JSON.parse(response.body))}
          </div>
        ) : activeTab === 'pretty' && bodyIsXML ? (
          <pre className="font-mono text-sm whitespace-pre-wrap">{response.body}</pre>
        ) : activeTab === 'raw' ? (
          <pre className="font-mono text-sm whitespace-pre-wrap">{response.body}</pre>
        ) : activeTab === 'preview' && bodyIsHTML ? (
          <iframe
            srcDoc={response.body}
            className="w-full h-full border border-border rounded"
            title="HTML Preview"
          />
        ) : activeTab === 'headers' ? (
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 py-2 border-b border-border">
                <span className="font-semibold text-sm min-w-[200px]">{key}</span>
                <span className="text-sm text-muted-foreground flex-1">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="font-mono text-sm whitespace-pre-wrap">{response.body}</pre>
        )}
      </div>
    </div>
  );
}
