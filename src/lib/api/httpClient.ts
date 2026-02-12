import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { HttpMethod, Response, Environment, AuthConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { substituteVariables, substituteHeaderVariables } from '@/lib/utils/variableSubstitution';

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  environment?: Environment | null;
  auth?: AuthConfig;
}

export class HttpClient {
  private applyAuth(auth: AuthConfig, headers: Record<string, string>): Record<string, string> {
    const newHeaders = { ...headers };

    switch (auth.type) {
      case 'basic':
        if (auth.basic) {
          const credentials = btoa(`${auth.basic.username}:${auth.basic.password}`);
          newHeaders['Authorization'] = `Basic ${credentials}`;
        }
        break;

      case 'bearer':
        if (auth.bearer) {
          newHeaders['Authorization'] = `Bearer ${auth.bearer.token}`;
        }
        break;

      case 'api-key':
        if (auth.apiKey) {
          if (auth.apiKey.addTo === 'header') {
            newHeaders[auth.apiKey.key] = auth.apiKey.value;
          }
          // For query params, we would need to modify the URL, which is handled elsewhere
        }
        break;

      case 'oauth2':
        if (auth.oauth2) {
          const tokenType = auth.oauth2.tokenType || 'Bearer';
          newHeaders['Authorization'] = `${tokenType} ${auth.oauth2.accessToken}`;
        }
        break;
    }

    return newHeaders;
  }

  private async makeRequest(config: RequestConfig): Promise<Response> {
    const startTime = Date.now();

    try {
      // Apply variable substitution
      const url = substituteVariables(config.url, config.environment || null);
      let headers = substituteHeaderVariables(config.headers || {}, config.environment || null);
      const body = config.body ? substituteVariables(config.body, config.environment || null) : undefined;

      // Apply authentication
      if (config.auth) {
        headers = this.applyAuth(config.auth, headers);
      }

      const axiosConfig: AxiosRequestConfig = {
        method: config.method.toLowerCase(),
        url,
        headers,
        timeout: config.timeout || 30000,
        validateStatus: () => true, // Don't throw on any status code
      };

      // Add body for methods that support it
      if (body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        try {
          // Try to parse as JSON
          axiosConfig.data = JSON.parse(body);
          if (axiosConfig.headers && !axiosConfig.headers['Content-Type']) {
            axiosConfig.headers['Content-Type'] = 'application/json';
          }
        } catch {
          // If not JSON, send as is
          axiosConfig.data = body;
        }
      }

      const response: AxiosResponse = await axios(axiosConfig);
      const endTime = Date.now();

      // Format response body
      let bodyString: string;
      if (typeof response.data === 'object') {
        bodyString = JSON.stringify(response.data, null, 2);
      } else {
        bodyString = String(response.data);
      }

      // Calculate size
      const size = new Blob([bodyString]).size;

      return {
        id: uuidv4(),
        requestId: '',
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        body: bodyString,
        size,
        time: endTime - startTime,
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string; response?: { data?: unknown } };
      const endTime = Date.now();
      
      // Handle network errors
      return {
        id: uuidv4(),
        requestId: '',
        status: 0,
        statusText: err.message || 'Network Error',
        headers: {},
        body: JSON.stringify({
          error: err.message,
          code: err.code,
          details: err.response?.data || 'Could not connect to server'
        }, null, 2),
        size: 0,
        time: endTime - startTime,
        timestamp: new Date(),
      };
    }
  }

  async send(config: RequestConfig): Promise<Response> {
    return this.makeRequest(config);
  }
}

export const httpClient = new HttpClient();