import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCollectionsStore } from '@/stores/collections';
import { useRequestsStore } from '@/stores/requests';
import { useEnvironmentsStore } from '@/stores/environments';
import {
  exportToPostman,
  exportEnvironment,
  importFromPostman,
  downloadFile,
  readFile,
} from '@/lib/importExport';

type ExportFormat = 'postman' | 'openapi' | 'insomnia' | 'tinx';
type ImportFormat = 'postman' | 'openapi' | 'insomnia' | 'tinx';

export function EnhancedImportExport() {
  const { collections, selectedCollectionId, createCollection } = useCollectionsStore();
  const { requests, createRequest } = useRequestsStore();
  const { environments, createEnvironment } = useEnvironmentsStore();
  
  const [exportFormat, setExportFormat] = useState<ExportFormat>('postman');
  const [importFormat, setImportFormat] = useState<ImportFormat>('postman');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExportCollection = () => {
    const collection = collections.find(c => c.id === selectedCollectionId);
    if (!collection) {
      setError('Please select a collection to export');
      return;
    }

    const collectionRequests = requests.filter(r => r.collectionId === collection.id);

    try {
      let content: string;
      let filename: string;

      switch (exportFormat) {
        case 'postman':
          content = exportToPostman(collection, collectionRequests);
          filename = `${collection.name}.postman_collection.json`;
          break;
        
        case 'tinx':
          content = JSON.stringify({
            version: '1.0',
            collection,
            requests: collectionRequests,
            exportedAt: new Date().toISOString(),
          }, null, 2);
          filename = `${collection.name}.tinx.json`;
          break;
        
        case 'openapi':
          setError('OpenAPI export coming soon!');
          return;
        
        case 'insomnia':
          setError('Insomnia export coming soon!');
          return;
        
        default:
          setError('Unsupported export format');
          return;
      }

      downloadFile(content, filename);
      setSuccess(`Exported ${collection.name} as ${exportFormat.toUpperCase()}`);
      setError('');
    } catch (err) {
      setError('Failed to export collection');
      console.error(err);
    }
  };

  const handleExportEnvironment = () => {
    const activeEnv = environments.find(e => e.isActive);
    if (!activeEnv) {
      setError('No active environment to export');
      return;
    }

    try {
      const content = exportEnvironment(activeEnv);
      downloadFile(content, `${activeEnv.name}.tinx_environment.json`);
      setSuccess(`Exported environment: ${activeEnv.name}`);
      setError('');
    } catch (err) {
      setError('Failed to export environment');
      console.error(err);
    }
  };

  const handleExportAll = () => {
    try {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        collections: collections.map(c => ({
          collection: c,
          requests: requests.filter(r => r.collectionId === c.id),
        })),
        environments,
      };

      const content = JSON.stringify(data, null, 2);
      downloadFile(content, 'tinx-backup.json');
      setSuccess('Exported all data successfully');
      setError('');
    } catch (err) {
      setError('Failed to export all data');
      console.error(err);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const content = await readFile(file);
      
      switch (importFormat) {
        case 'postman': {
          const { collection, requests: importedRequests } = importFromPostman(content);
          const newCollection = await createCollection(
            collection.name || 'Imported Collection',
            collection.description
          );
          
          for (const req of importedRequests) {
            await createRequest(
              req.name || 'Untitled Request',
              req.method as any,
              req.url || '',
              newCollection.id
            );
          }
          
          setSuccess(`Imported ${importedRequests.length} requests`);
          break;
        }
        
        case 'tinx': {
          const data = JSON.parse(content);
          if (data.collection) {
            // Single collection import
            const newCollection = await createCollection(
              data.collection.name,
              data.collection.description
            );
            
            for (const req of data.requests || []) {
              await createRequest(
                req.name,
                req.method,
                req.url,
                newCollection.id
              );
            }
            setSuccess('Imported Tinx collection successfully');
          } else if (data.collections) {
            // Full backup import
            for (const item of data.collections) {
              const newCollection = await createCollection(
                item.collection.name,
                item.collection.description
              );
              
              for (const req of item.requests || []) {
                await createRequest(
                  req.name,
                  req.method,
                  req.url,
                  newCollection.id
                );
              }
            }
            
            if (data.environments) {
              for (const env of data.environments) {
                await createEnvironment(env.name);
              }
            }
            
            setSuccess('Imported full backup successfully');
          }
          break;
        }
        
        case 'openapi':
          setError('OpenAPI import coming soon!');
          break;
        
        case 'insomnia':
          setError('Insomnia import coming soon!');
          break;
        
        default:
          setError('Unsupported import format');
      }
    } catch (err) {
      setError('Failed to import file. Please check the format.');
      console.error(err);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="p-4 bg-card rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Export</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded"
            >
              <option value="postman">Postman Collection v2.1</option>
              <option value="tinx">Tinx Format (Native)</option>
              <option value="openapi">OpenAPI 3.0 (Coming Soon)</option>
              <option value="insomnia">Insomnia (Coming Soon)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExportCollection}
              disabled={!selectedCollectionId}
              className="flex-1"
            >
              Export Selected Collection
            </Button>
            <Button
              onClick={handleExportEnvironment}
              variant="outline"
              className="flex-1"
            >
              Export Environment
            </Button>
          </div>

          <Button
            onClick={handleExportAll}
            variant="outline"
            className="w-full"
          >
            Export All Data (Backup)
          </Button>
        </div>
      </div>

      {/* Import Section */}
      <div className="p-4 bg-card rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Import</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Import Format</label>
            <select
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value as ImportFormat)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded"
            >
              <option value="postman">Postman Collection</option>
              <option value="tinx">Tinx Format</option>
              <option value="openapi">OpenAPI (Coming Soon)</option>
              <option value="insomnia">Insomnia (Coming Soon)</option>
            </select>
          </div>

          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button
                as="span"
                disabled={importing}
                className="w-full cursor-pointer"
              >
                {importing ? 'Importing...' : 'Choose File to Import'}
              </Button>
            </label>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500 rounded text-sm text-green-500">
          {success}
        </div>
      )}
    </div>
  );
}