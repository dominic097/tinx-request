import { httpClient } from './api/httpClient';
import { cookieJar } from './cookieJar';
import type { Cookie } from './cookieJar';

// Simple script execution engine for pre-request and test scripts
export class ScriptEngine {
  private environment: any;
  private globals: any;

  constructor(environment: any = {}, globals: any = {}) {
    this.environment = environment;
    this.globals = globals;
  }

  // Execute pre-request script
  async executePreRequest(script: string, request: any): Promise<any> {
    const pm = this.createPmObject(request);

    try {
      // Create a function from the script and execute it
      const scriptFunction = new Function('pm', script);
      scriptFunction(pm);

      // Return modified request
      return pm.request;
    } catch (error) {
      console.error('Pre-request script error:', error);
      throw error;
    }
  }

  // Execute test script
  async executeTests(script: string, request: any, response: any): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const pm = this.createPmObject(request, response, results);

    try {
      const scriptFunction = new Function('pm', script);
      scriptFunction(pm);
    } catch (error) {
      console.error('Test script error:', error);
      results.push({
        name: 'Script Error',
        passed: false,
        error: (error as Error).message,
      });
    }

    return results;
  }

  private createPmObject(request: any, response?: any, testResults?: TestResult[]) {
    const self = this;

    return {
      // Environment
      environment: {
        get: (key: string) => self.environment[key],
        set: (key: string, value: any) => {
          self.environment[key] = value;
        },
      },

      // Globals
      globals: {
        get: (key: string) => self.globals[key],
        set: (key: string, value: any) => {
          self.globals[key] = value;
        },
      },

      // Variables (combined environment and globals)
      variables: {
        get: (key: string) => self.environment[key] || self.globals[key],
        set: (key: string, value: any) => {
          self.environment[key] = value;
        },
      },

      // Cookies management
      cookies: {
        get: (url: string) => {
          try {
            const urlObj = new URL(url);
            const cookies = cookieJar.getCookies(urlObj.hostname, urlObj.pathname);
            return cookies.reduce((acc, cookie) => {
              acc[cookie.name] = cookie.value;
              return acc;
            }, {} as Record<string, string>);
          } catch {
            return {};
          }
        },
        set: (url: string, name: string, value: string) => {
          try {
            const urlObj = new URL(url);
            const cookie: Cookie = {
              name,
              value,
              domain: urlObj.hostname,
              path: '/',
              httpOnly: false,
              secure: urlObj.protocol === 'https:',
            };
            cookieJar.setCookie(cookie);
          } catch (error) {
            console.error('Failed to set cookie:', error);
          }
        },
        clear: (url: string) => {
          try {
            const urlObj = new URL(url);
            cookieJar.clearDomain(urlObj.hostname);
          } catch (error) {
            console.error('Failed to clear cookies:', error);
          }
        },
        jar: () => cookieJar,
      },

      // Send additional requests (for chaining)
      sendRequest: async (requestOptions: any) => {
        try {
          const response = await httpClient.send({
            method: requestOptions.method || 'GET',
            url: requestOptions.url,
            headers: requestOptions.headers || {},
            body: requestOptions.body,
            environment: null,
          });

          return {
            code: response.status,
            status: response.statusText,
            headers: response.headers,
            body: response.body,
            json: () => {
              try {
                return JSON.parse(response.body);
              } catch {
                return null;
              }
            },
            text: () => response.body,
            responseTime: response.time,
          };
        } catch (error) {
          console.error('pm.sendRequest failed:', error);
          throw error;
        }
      },

      // Request
      request: {
        url: request.url,
        method: request.method,
        headers: new Map(Object.entries(request.headers || {})),
        body: request.body,
        addHeader: (key: string, value: string) => {
          if (!request.headers) request.headers = {};
          request.headers[key] = value;
        },
        removeHeader: (key: string) => {
          if (request.headers) delete request.headers[key];
        },
      },

      // Response (only available in test scripts)
      response: response ? {
        code: response.status,
        status: response.statusText,
        headers: new Map(Object.entries(response.headers || {})),
        body: response.body,
        json: () => {
          try {
            return JSON.parse(response.body);
          } catch {
            return null;
          }
        },
        text: () => response.body,
        responseTime: response.time,
      } : undefined,

      // Test assertions
      test: (name: string, fn: () => void) => {
        if (!testResults) return;

        try {
          fn();
          testResults.push({ name, passed: true });
        } catch (error) {
          testResults.push({
            name,
            passed: false,
            error: (error as Error).message,
          });
        }
      },

      // Expectations
      expect: (value: any) => ({
        to: {
          equal: (expected: any) => {
            if (value !== expected) {
              throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(value)}`);
            }
          },
          eql: (expected: any) => {
            if (JSON.stringify(value) !== JSON.stringify(expected)) {
              throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(value)}`);
            }
          },
          be: {
            a: (type: string) => {
              if (typeof value !== type) {
                throw new Error(`Expected type ${type} but got ${typeof value}`);
              }
            },
            above: (num: number) => {
              if (value <= num) {
                throw new Error(`Expected ${value} to be above ${num}`);
              }
            },
            below: (num: number) => {
              if (value >= num) {
                throw new Error(`Expected ${value} to be below ${num}`);
              }
            },
          },
          have: {
            property: (prop: string) => {
              if (!value || !(prop in value)) {
                throw new Error(`Expected to have property ${prop}`);
              }
            },
            length: (len: number) => {
              if (!value || value.length !== len) {
                throw new Error(`Expected length ${len} but got ${value?.length}`);
              }
            },
          },
          include: (substring: any) => {
            if (typeof value === 'string' && !value.includes(substring)) {
              throw new Error(`Expected "${value}" to include "${substring}"`);
            } else if (Array.isArray(value) && !value.includes(substring)) {
              throw new Error(`Expected array to include ${substring}`);
            }
          },
        },
      }),
    };
  }
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}
