import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RequestBuilder } from '@/components/features/RequestBuilder';
import { ResponseViewer } from '@/components/features/ResponseViewer';
import { CollectionsSidebar } from '@/components/features/CollectionsSidebar';
import { EnvironmentManager } from '@/components/features/EnvironmentManager';
import { HistoryPanel } from '@/components/features/HistoryPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { httpClient } from '@/lib/api/httpClient';
import { useRequestsStore } from '@/stores/requests';
import { useCollectionsStore } from '@/stores/collections';
import { useEnvironmentsStore } from '@/stores/environments';
import { useHistoryStore } from '@/stores/history';
import type { HttpMethod, Response, Request } from '@/types';
import { HttpMethod as HttpMethodEnum } from '@/types';

function App() {
  const [response, setResponse] = useState<Response | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<{
    id?: string;
    name: string;
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: string;
  }>({
    name: 'Untitled Request',
    method: HttpMethodEnum.GET,
    url: '',
    headers: {},
    body: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [envManagerOpen, setEnvManagerOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);

  const { createRequest, updateRequest } = useRequestsStore();
  const { collections, fetchCollections } = useCollectionsStore();
  const { activeEnvironment, fetchEnvironments } = useEnvironmentsStore();
  const { addToHistory } = useHistoryStore();

  useEffect(() => {
    fetchCollections();
    fetchEnvironments();
  }, [fetchCollections, fetchEnvironments]);

  const handleSendRequest = async (
    method: HttpMethod,
    url: string,
    headers: Record<string, string>,
    body?: string,
    auth?: any
  ) => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    // Update current request state
    setCurrentRequest(prev => ({ ...prev, method, url, headers, body }));

    setIsLoading(true);
    setResponse(null);

    try {
      const result = await httpClient.send({
        method,
        url,
        headers,
        body,
        environment: activeEnvironment,
        auth,
      });
      setResponse(result);

      // Save to history
      const requestForHistory: Request = {
        id: currentRequest.id || crypto.randomUUID(),
        name: currentRequest.name,
        method,
        url,
        headers: Object.entries(headers).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value,
          enabled: true,
        })),
        body: body ? { type: 'json' as const, raw: body } : undefined,
        params: [],
        pathVariables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addToHistory(requestForHistory, result);
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = (request: Request) => {
    setCurrentRequest({
      id: request.id,
      name: request.name,
      method: request.method,
      url: request.url,
      headers: request.headers.reduce((acc, h) => {
        if (h.enabled) acc[h.key] = h.value;
        return acc;
      }, {} as Record<string, string>),
      body: request.body?.raw,
    });
    setResponse(null);
  };

  const handleNewRequest = () => {
    setCurrentRequest({
      name: 'Untitled Request',
      method: HttpMethodEnum.GET,
      url: '',
      headers: {},
      body: '',
    });
    setResponse(null);
  };

  const handleSaveRequest = async (collectionId: string) => {
    if (!currentRequest.url) {
      alert('Please enter a URL before saving');
      return;
    }

    setIsSaving(true);
    try {
      const headers = Object.entries(currentRequest.headers).map(([key, value]) => ({
        id: crypto.randomUUID(),
        key,
        value,
        enabled: true,
      }));

      if (currentRequest.id) {
        // Update existing request
        await updateRequest(currentRequest.id, {
          name: currentRequest.name,
          method: currentRequest.method,
          url: currentRequest.url,
          headers,
          body: currentRequest.body ? { type: 'json' as const, raw: currentRequest.body } : undefined,
        });
      } else {
        // Create new request
        const newRequest = await createRequest(
          currentRequest.name,
          currentRequest.method,
          currentRequest.url,
          collectionId
        );
        
        // Update with full details
        await updateRequest(newRequest.id, {
          headers,
          body: currentRequest.body ? { type: 'json' as const, raw: currentRequest.body } : undefined,
        });
        
        setCurrentRequest(prev => ({ ...prev, id: newRequest.id }));
      }
      
      setSaveDialogOpen(false);
      alert('Request saved successfully!');
    } catch (error) {
      console.error('Failed to save request:', error);
      alert('Failed to save request');
    } finally {
      setIsSaving(false);
    }
  };

  const sidebar = (
    <CollectionsSidebar
      onSelectRequest={handleSelectRequest}
      onNewRequest={handleNewRequest}
    />
  );

  const statusBar = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <span>Ready</span>
        {currentRequest.id && (
          <span className="text-xs">Saved: {currentRequest.name}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSaveDialogOpen(true)}
          className="text-xs hover:underline"
          disabled={!currentRequest.url}
        >
          {currentRequest.id ? 'Update' : 'Save'} Request
        </button>
        <button
          onClick={() => setHistoryPanelOpen(true)}
          className="text-xs hover:underline"
        >
          History
        </button>
        <button
          onClick={() => setEnvManagerOpen(true)}
          className="text-xs hover:underline"
        >
          {activeEnvironment ? activeEnvironment.name : 'No Environment'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <MainLayout sidebar={sidebar} statusBar={statusBar}>
        <div className="flex flex-col h-full">
          {/* Request Builder - Top Half */}
          <div className="h-1/2 border-b border-border">
            <RequestBuilder onSend={handleSendRequest} />
          </div>

          {/* Response Viewer - Bottom Half */}
          <div className="h-1/2">
            <ResponseViewer response={response} isLoading={isLoading} />
          </div>
        </div>
      </MainLayout>

      {/* Save Dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Request</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Request Name</label>
                <Input
                  type="text"
                  value={currentRequest.name}
                  onChange={(e) => setCurrentRequest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter request name"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Collection</label>
                <select
                  className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                  onChange={(e) => e.target.value && handleSaveRequest(e.target.value)}
                  disabled={isSaving}
                  defaultValue=""
                >
                  <option value="" disabled>Select a collection...</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
                {collections.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a collection first to save requests
                  </p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment Manager */}
      {envManagerOpen && (
        <EnvironmentManager onClose={() => setEnvManagerOpen(false)} />
      )}

      {/* History Panel */}
      {historyPanelOpen && (
        <HistoryPanel
          onSelectHistoryItem={handleSelectRequest}
          onClose={() => setHistoryPanelOpen(false)}
        />
      )}
    </>
  );
}

export default App;
