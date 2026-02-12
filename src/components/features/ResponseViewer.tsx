import { useState } from 'react';
import type { Response } from '@/types';

interface ResponseViewerProps {
  response: Response | null;
  isLoading: boolean;
}

export function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState('body');
  const [bodyView, setBodyView] = useState<'pretty' | 'raw'>('pretty');

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
        <div className="text-center text-muted-foreground">
          <svg
            className="w-24 h-24 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>Send a request to see the response</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 300 && status < 400) return 'text-blue-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatBody = () => {
    try {
      const parsed = JSON.parse(response.body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return response.body;
    }
  };

  const isJSON = () => {
    try {
      JSON.parse(response.body);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Response Status Bar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className={`font-semibold ${getStatusColor(response.status)}`}>
              {response.status} {response.statusText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time:</span>
            <span className="font-semibold">{response.time}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Size:</span>
            <span className="font-semibold">{(response.size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border">
          <div className="flex gap-4 px-4">
            {['Body', 'Headers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-3 px-2 border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'body' && (
            <div className="h-full flex flex-col">
              {isJSON() && (
                <div className="flex gap-2 p-2 border-b border-border">
                  <button
                    onClick={() => setBodyView('pretty')}
                    className={`px-3 py-1 text-sm rounded ${
                      bodyView === 'pretty'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pretty
                  </button>
                  <button
                    onClick={() => setBodyView('raw')}
                    className={`px-3 py-1 text-sm rounded ${
                      bodyView === 'raw'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Raw
                  </button>
                </div>
              )}
              <pre className="flex-1 p-4 overflow-auto bg-secondary text-sm font-mono">
                {bodyView === 'pretty' && isJSON() ? formatBody() : response.body}
              </pre>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="p-4">
              <div className="space-y-2">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-semibold text-foreground">{key}:</div>
                    <div className="text-muted-foreground break-all">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}