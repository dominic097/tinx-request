import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportToPostman, downloadFile } from '@/lib/importExport';
import type { Collection, Request } from '@/types';

interface ShareCollectionModalProps {
  collection: Collection;
  requests: Request[];
  onClose: () => void;
}

export function ShareCollectionModal({ collection, requests, onClose }: ShareCollectionModalProps) {
  const [shareMethod, setShareMethod] = useState<'link' | 'export' | 'json'>('link');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate shareable link (in a real app, this would create a link on your backend)
  const generateShareLink = () => {
    const collectionData = exportToPostman(collection, requests);
    const encoded = btoa(collectionData);
    const link = `${window.location.origin}/import?data=${encoded}`;
    setShareLink(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPostman = () => {
    const json = exportToPostman(collection, requests);
    downloadFile(json, `${collection.name}.postman_collection.json`);
  };

  const handleExportJSON = () => {
    const data = {
      collection,
      requests,
    };
    downloadFile(JSON.stringify(data, null, 2), `${collection.name}.json`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Share Collection</h2>
            <p className="text-sm text-muted-foreground">{collection.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Method Selector */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <button
              onClick={() => setShareMethod('link')}
              className={`px-4 py-2 rounded ${
                shareMethod === 'link'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Share Link
            </button>
            <button
              onClick={() => setShareMethod('export')}
              className={`px-4 py-2 rounded ${
                shareMethod === 'export'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Export Postman
            </button>
            <button
              onClick={() => setShareMethod('json')}
              className={`px-4 py-2 rounded ${
                shareMethod === 'json'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {shareMethod === 'link' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate a shareable link that anyone can use to import this collection.
                </p>
                {!shareLink ? (
                  <Button onClick={generateShareLink}>Generate Link</Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button onClick={handleCopy} className="w-full">
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This link contains the full collection data. Anyone with this link can import it.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {shareMethod === 'export' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export this collection in Postman format. The file can be imported into Postman or other compatible tools.
              </p>
              <Button onClick={handleExportPostman} className="w-full">
                Download Postman Collection
              </Button>
              <div className="p-3 bg-secondary rounded">
                <p className="text-xs text-muted-foreground">
                  <strong>File includes:</strong>
                  <br />
                  • {requests.length} requests
                  <br />
                  • All headers and parameters
                  <br />
                  • Request descriptions
                </p>
              </div>
            </div>
          )}

          {shareMethod === 'json' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export the collection in native JSON format. This includes all Tinx-specific features.
              </p>
              <Button onClick={handleExportJSON} className="w-full">
                Download JSON
              </Button>
              <div className="p-3 bg-secondary rounded">
                <p className="text-xs text-muted-foreground">
                  <strong>File includes:</strong>
                  <br />
                  • Complete collection metadata
                  <br />
                  • All requests with full configuration
                  <br />
                  • Authentication settings
                  <br />
                  • Variables and scripts
                </p>
              </div>
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
