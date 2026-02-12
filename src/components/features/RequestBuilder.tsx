import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthConfig } from './AuthConfig';
import { HttpMethod } from '@/types';
import type { HttpMethod as HttpMethodType, AuthConfig as AuthConfigType } from '@/types';
import { extractPathVariables, replacePathVariables } from '@/lib/utils/pathVariables';
import { buildFormData, type FormDataField } from '@/lib/formData';

interface RequestBuilderProps {
  onSend: (method: HttpMethodType, url: string, headers: Record<string, string>, body?: string, auth?: AuthConfigType) => void;
}

export function RequestBuilder({ onSend }: RequestBuilderProps) {
  const [method, setMethod] = useState<HttpMethodType>(HttpMethod.GET);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('params');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string; enabled: boolean }>>([
    { key: '', value: '', enabled: true }
  ]);
  const [bodyType, setBodyType] = useState<'json' | 'text' | 'formdata'>('json');
  const [body, setBody] = useState('');
  const [formDataFields, setFormDataFields] = useState<FormDataField[]>([
    { id: crypto.randomUUID(), key: '', value: '', type: 'text', enabled: true }
  ]);
  const [auth, setAuth] = useState<AuthConfigType | undefined>(undefined);
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string; enabled: boolean }>>([
    { key: '', value: '', enabled: true }
  ]);
  const [pathVariables, setPathVariables] = useState<Array<{ key: string; value: string }>>([]);

  const methods: HttpMethodType[] = [
    HttpMethod.GET,
    HttpMethod.POST,
    HttpMethod.PUT,
    HttpMethod.PATCH,
    HttpMethod.DELETE,
    HttpMethod.HEAD,
    HttpMethod.OPTIONS,
  ];

  const handleSend = () => {
    const enabledHeaders = headers
      .filter(h => h.enabled && h.key)
      .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

    // Replace path variables
    let finalUrl = replacePathVariables(url, pathVariables);

    // Build URL with query parameters
    const enabledParams = queryParams.filter(p => p.enabled && p.key);
    if (enabledParams.length > 0) {
      try {
        const urlObj = new URL(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`);
        enabledParams.forEach(p => urlObj.searchParams.set(p.key, p.value));
        finalUrl = urlObj.toString();
      } catch {
        // If URL is invalid, append query params manually
        const queryString = enabledParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
        finalUrl = finalUrl.includes('?') ? `${finalUrl}&${queryString}` : `${finalUrl}?${queryString}`;
      }
    }

    // Handle form-data body
    let finalBody = body;
    if (bodyType === 'formdata') {
      // For form-data, we'll need to modify the onSend signature or handle it differently
      // For now, we'll serialize it as JSON for demonstration
      const formData = buildFormData(formDataFields);
      // In a real implementation, you'd pass the FormData object directly
      finalBody = JSON.stringify(Object.fromEntries(formData));
    }

    onSend(method, finalUrl, enabledHeaders, finalBody, auth);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '', enabled: true }]);
  };

  const updateQueryParam = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newParams = [...queryParams];
    newParams[index] = { ...newParams[index], [field]: value };
    setQueryParams(newParams);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const updatePathVariable = (index: number, value: string) => {
    const newVars = [...pathVariables];
    newVars[index] = { ...newVars[index], value };
    setPathVariables(newVars);
  };

  // Form-data field management
  const addFormDataField = () => {
    setFormDataFields([...formDataFields, {
      id: crypto.randomUUID(),
      key: '',
      value: '',
      type: 'text',
      enabled: true
    }]);
  };

  const updateFormDataField = (index: number, field: keyof FormDataField, value: any) => {
    const newFields = [...formDataFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormDataFields(newFields);
  };

  const removeFormDataField = (index: number) => {
    setFormDataFields(formDataFields.filter((_, i) => i !== index));
  };

  const handleFileSelect = (index: number, file: File | null) => {
    const newFields = [...formDataFields];
    newFields[index] = { ...newFields[index], file: file || undefined };
    setFormDataFields(newFields);
  };

  // Extract path variables from URL
  useEffect(() => {
    const varNames = extractPathVariables(url);
    setPathVariables(varNames.map(key => {
      const existing = pathVariables.find(v => v.key === key);
      return { key, value: existing?.value || '' };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const getMethodColor = (m: HttpMethodType) => {
    const colors: Record<HttpMethodType, string> = {
      [HttpMethod.GET]: 'text-green-500',
      [HttpMethod.POST]: 'text-yellow-500',
      [HttpMethod.PUT]: 'text-blue-500',
      [HttpMethod.PATCH]: 'text-purple-500',
      [HttpMethod.DELETE]: 'text-red-500',
      [HttpMethod.HEAD]: 'text-gray-500',
      [HttpMethod.OPTIONS]: 'text-gray-500',
    };
    return colors[m] || 'text-gray-500';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Request URL Bar */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          {/* Method Dropdown */}
          <div className="relative">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethodType)}
              className={`px-4 py-2 bg-secondary text-secondary-foreground rounded border border-border font-semibold ${getMethodColor(method)} cursor-pointer`}
            >
              {methods.map((m) => (
                <option key={m} value={m} className={getMethodColor(m)}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* URL Input */}
          <Input
            type="text"
            placeholder="Enter request URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />

          {/* Send Button */}
          <Button onClick={handleSend} className="px-8">
            Send
          </Button>
        </div>
      </div>

      {/* Request Configuration Tabs */}
      <div className="flex-1 overflow-auto">
        <div className="border-b border-border">
          <div className="flex gap-4 px-4">
            {['Params', 'Headers', 'Body', 'Auth'].map((tab) => (
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

        <div className="p-4">
          {activeTab === 'params' && (
            <div className="space-y-4">
              {/* Path Variables */}
              {pathVariables.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Path Variables</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="col-span-6">Variable</div>
                      <div className="col-span-6">Value</div>
                    </div>
                    {pathVariables.map((variable, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2">
                        <div className="col-span-6">
                          <Input
                            type="text"
                            value={`:${variable.key}`}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="col-span-6">
                          <Input
                            type="text"
                            placeholder={`Enter value for ${variable.key}`}
                            value={variable.value}
                            onChange={(e) => updatePathVariable(index, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Query Parameters */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Query Parameters</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground mb-2">
                    <div className="col-span-5">Key</div>
                    <div className="col-span-5">Value</div>
                    <div className="col-span-2"></div>
                  </div>
                  {queryParams.map((param, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Input
                          type="text"
                          placeholder="Parameter name"
                          value={param.key}
                          onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          type="text"
                          placeholder="Parameter value"
                          value={param.value}
                          onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => updateQueryParam(index, 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <button
                          onClick={() => removeQueryParam(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addQueryParam} variant="outline" size="sm">
                    Add Parameter
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground mb-2">
                <div className="col-span-5">Key</div>
                <div className="col-span-5">Value</div>
                <div className="col-span-2"></div>
              </div>
              {headers.map((header, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Input
                      type="text"
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      type="text"
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <button
                      onClick={() => removeHeader(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <Button onClick={addHeader} variant="outline" size="sm">
                Add Header
              </Button>
            </div>
          )}

          {activeTab === 'body' && (
            <div className="space-y-4">
              {/* Body Type Selector */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setBodyType('json')}
                  className={`px-3 py-1 text-sm rounded ${
                    bodyType === 'json'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setBodyType('text')}
                  className={`px-3 py-1 text-sm rounded ${
                    bodyType === 'text'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setBodyType('formdata')}
                  className={`px-3 py-1 text-sm rounded ${
                    bodyType === 'formdata'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Form Data
                </button>
              </div>

              {/* JSON/Text Body */}
              {(bodyType === 'json' || bodyType === 'text') && (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Enter text body...'}
                  className="w-full h-64 p-3 bg-secondary text-foreground rounded border border-border font-mono text-sm resize-none"
                />
              )}

              {/* Form Data Body */}
              {bodyType === 'formdata' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground mb-2">
                    <div className="col-span-4">Key</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-3">Value</div>
                    <div className="col-span-2"></div>
                  </div>
                  {formDataFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <Input
                          type="text"
                          placeholder="Field name"
                          value={field.key}
                          onChange={(e) => updateFormDataField(index, 'key', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={field.type}
                          onChange={(e) => updateFormDataField(index, 'type', e.target.value as 'text' | 'file')}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        {field.type === 'text' ? (
                          <Input
                            type="text"
                            placeholder="Value"
                            value={field.value}
                            onChange={(e) => updateFormDataField(index, 'value', e.target.value)}
                          />
                        ) : (
                          <div>
                            <input
                              type="file"
                              onChange={(e) => handleFileSelect(index, e.target.files?.[0] || null)}
                              className="hidden"
                              id={`file-${field.id}`}
                            />
                            <label
                              htmlFor={`file-${field.id}`}
                              className="block w-full px-3 py-2 bg-secondary border border-border rounded text-sm cursor-pointer hover:bg-secondary/80 truncate"
                            >
                              {field.file ? field.file.name : 'Choose File'}
                            </label>
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.enabled}
                          onChange={(e) => updateFormDataField(index, 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <button
                          onClick={() => removeFormDataField(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addFormDataField} variant="outline" size="sm">
                    Add Field
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'auth' && (
            <AuthConfig auth={auth} onAuthChange={setAuth} />
          )}
        </div>
      </div>
    </div>
  );
}