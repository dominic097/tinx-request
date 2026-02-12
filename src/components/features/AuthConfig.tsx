import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AuthConfig as AuthConfigType, AuthType } from '@/types';
import { AuthType as AuthTypeEnum } from '@/types';

interface AuthConfigProps {
  auth?: AuthConfigType;
  onAuthChange: (auth: AuthConfigType | undefined) => void;
}

export function AuthConfig({ auth, onAuthChange }: AuthConfigProps) {
  const [authType, setAuthType] = useState<AuthType>(auth?.type || AuthTypeEnum.NONE);
  const [basicUsername, setBasicUsername] = useState(auth?.basic?.username || '');
  const [basicPassword, setBasicPassword] = useState(auth?.basic?.password || '');
  const [bearerToken, setBearerToken] = useState(auth?.bearer?.token || '');
  const [apiKeyKey, setApiKeyKey] = useState(auth?.apiKey?.key || '');
  const [apiKeyValue, setApiKeyValue] = useState(auth?.apiKey?.value || '');
  const [apiKeyAddTo, setApiKeyAddTo] = useState<'header' | 'query'>(auth?.apiKey?.addTo || 'header');
  const [oauth2Token, setOauth2Token] = useState(auth?.oauth2?.accessToken || '');
  const [oauth2TokenType, setOauth2TokenType] = useState(auth?.oauth2?.tokenType || 'Bearer');

  const handleAuthTypeChange = (newType: AuthType) => {
    setAuthType(newType);
    if (newType === AuthTypeEnum.NONE) {
      onAuthChange(undefined);
    }
  };

  const handleApply = () => {
    if (authType === AuthTypeEnum.NONE) {
      onAuthChange(undefined);
      return;
    }

    const newAuth: AuthConfigType = { type: authType };

    switch (authType) {
      case AuthTypeEnum.BASIC:
        newAuth.basic = { username: basicUsername, password: basicPassword };
        break;
      case AuthTypeEnum.BEARER:
        newAuth.bearer = { token: bearerToken };
        break;
      case AuthTypeEnum.API_KEY:
        newAuth.apiKey = { key: apiKeyKey, value: apiKeyValue, addTo: apiKeyAddTo };
        break;
      case AuthTypeEnum.OAUTH2:
        newAuth.oauth2 = { accessToken: oauth2Token, tokenType: oauth2TokenType };
        break;
    }

    onAuthChange(newAuth);
  };

  return (
    <div className="space-y-4">
      {/* Auth Type Selector */}
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Authentication Type</label>
        <select
          value={authType}
          onChange={(e) => handleAuthTypeChange(e.target.value as AuthType)}
          className="w-full p-2 bg-secondary border border-border rounded text-foreground"
        >
          <option value={AuthTypeEnum.NONE}>No Auth</option>
          <option value={AuthTypeEnum.BASIC}>Basic Auth</option>
          <option value={AuthTypeEnum.BEARER}>Bearer Token</option>
          <option value={AuthTypeEnum.API_KEY}>API Key</option>
          <option value={AuthTypeEnum.OAUTH2}>OAuth 2.0</option>
        </select>
      </div>

      {/* Basic Auth */}
      {authType === AuthTypeEnum.BASIC && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Username</label>
            <Input
              type="text"
              value={basicUsername}
              onChange={(e) => setBasicUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Password</label>
            <Input
              type="password"
              value={basicPassword}
              onChange={(e) => setBasicPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
        </div>
      )}

      {/* Bearer Token */}
      {authType === AuthTypeEnum.BEARER && (
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Token</label>
          <Input
            type="text"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            placeholder="Enter bearer token"
          />
        </div>
      )}

      {/* API Key */}
      {authType === AuthTypeEnum.API_KEY && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Key</label>
            <Input
              type="text"
              value={apiKeyKey}
              onChange={(e) => setApiKeyKey(e.target.value)}
              placeholder="e.g., X-API-Key"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Value</label>
            <Input
              type="text"
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder="Enter API key value"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Add to</label>
            <select
              value={apiKeyAddTo}
              onChange={(e) => setApiKeyAddTo(e.target.value as 'header' | 'query')}
              className="w-full p-2 bg-secondary border border-border rounded text-foreground"
            >
              <option value="header">Header</option>
              <option value="query">Query Params</option>
            </select>
          </div>
        </div>
      )}

      {/* OAuth 2.0 */}
      {authType === AuthTypeEnum.OAUTH2 && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Access Token</label>
            <Input
              type="text"
              value={oauth2Token}
              onChange={(e) => setOauth2Token(e.target.value)}
              placeholder="Enter access token"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Token Type</label>
            <Input
              type="text"
              value={oauth2TokenType}
              onChange={(e) => setOauth2TokenType(e.target.value)}
              placeholder="Bearer"
            />
          </div>
        </div>
      )}

      {/* Apply Button */}
      {authType !== AuthTypeEnum.NONE && (
        <div className="pt-2">
          <Button onClick={handleApply} className="w-full">
            Apply Authentication
          </Button>
        </div>
      )}
    </div>
  );
}
