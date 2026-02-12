import type { Collection, Request, Environment } from '@/types';

// Export collection to Postman format
export function exportToPostman(collection: Collection, requests: Request[]): string {
  const postmanCollection = {
    info: {
      name: collection.name,
      description: collection.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: requests.map(req => ({
      name: req.name,
      request: {
        method: req.method,
        header: req.headers.map(h => ({
          key: h.key,
          value: h.value,
          type: 'text',
        })),
        url: {
          raw: req.url,
          host: req.url.split('//')[1]?.split('/')[0]?.split('.') || [],
          path: req.url.split('//')[1]?.split('/').slice(1) || [],
        },
        body: req.body ? {
          mode: req.body.type === 'json' ? 'raw' : req.body.type,
          raw: req.body.raw || '',
        } : undefined,
        description: req.description || '',
      },
      response: [],
    })),
  };

  return JSON.stringify(postmanCollection, null, 2);
}

// Export environment
export function exportEnvironment(environment: Environment): string {
  return JSON.stringify({
    name: environment.name,
    values: environment.variables.map(v => ({
      key: v.key,
      value: v.value,
      type: v.type,
      enabled: v.enabled,
    })),
  }, null, 2);
}

// Import from Postman format
export function importFromPostman(json: string): {
  collection: Partial<Collection>;
  requests: Partial<Request>[];
} {
  const data = JSON.parse(json);

  const collection: Partial<Collection> = {
    name: data.info?.name || 'Imported Collection',
    description: data.info?.description || '',
    variables: [],
  };

  const requests: Partial<Request>[] = (data.item || []).map((item: any) => ({
    name: item.name,
    method: item.request.method,
    url: item.request.url?.raw || item.request.url,
    headers: (item.request.header || []).map((h: any) => ({
      id: crypto.randomUUID(),
      key: h.key,
      value: h.value,
      enabled: !h.disabled,
    })),
    body: item.request.body ? {
      type: item.request.body.mode === 'raw' ? 'json' : item.request.body.mode,
      raw: item.request.body.raw || '',
    } : undefined,
    params: [],
    pathVariables: [],
    description: item.request.description || '',
  }));

  return { collection, requests };
}

// Download file helper
export function downloadFile(content: string, filename: string, type: string = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Read file helper
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
