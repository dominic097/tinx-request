import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { httpClient } from '@/lib/api/httpClient';
import { ScriptEngine, type TestResult } from '@/lib/scriptEngine';
import type { Request, Collection } from '@/types';

interface CollectionRunnerProps {
  collection: Collection;
  requests: Request[];
  onClose: () => void;
}

interface RunResult {
  request: Request;
  response: any;
  tests: TestResult[];
  error?: string;
}

export function CollectionRunner({ collection, requests, onClose }: CollectionRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const runCollection = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentIndex(0);

    const scriptEngine = new ScriptEngine();
    const runResults: RunResult[] = [];

    for (let i = 0; i < requests.length; i++) {
      setCurrentIndex(i);
      const request = requests[i];

      try {
        // Execute pre-request script
        let modifiedRequest = { ...request };
        if (request.preRequestScript) {
          try {
            modifiedRequest = await scriptEngine.executePreRequest(
              request.preRequestScript,
              modifiedRequest
            );
          } catch (error) {
            runResults.push({
              request,
              response: null,
              tests: [],
              error: `Pre-request script error: ${(error as Error).message}`,
            });
            continue;
          }
        }

        // Send request
        const headers = modifiedRequest.headers.reduce((acc, h) => {
          if (h.enabled) acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>);

        const response = await httpClient.send({
          method: modifiedRequest.method,
          url: modifiedRequest.url,
          headers,
          body: modifiedRequest.body?.raw,
        });

        // Execute test script
        let testResults: TestResult[] = [];
        if (request.testScript) {
          try {
            testResults = await scriptEngine.executeTests(
              request.testScript,
              modifiedRequest,
              response
            );
          } catch (error) {
            testResults = [{
              name: 'Script Error',
              passed: false,
              error: (error as Error).message,
            }];
          }
        }

        runResults.push({
          request,
          response,
          tests: testResults,
        });
      } catch (error) {
        runResults.push({
          request,
          response: null,
          tests: [],
          error: (error as Error).message,
        });
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults(runResults);
    setIsRunning(false);
  };

  const totalTests = results.reduce((sum, r) => sum + r.tests.length, 0);
  const passedTests = results.reduce((sum, r) => sum + r.tests.filter(t => t.passed).length, 0);
  const successfulRequests = results.filter(r => r.response && !r.error).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[900px] h-[700px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Run Collection: {collection.name}</h2>
            <p className="text-sm text-muted-foreground">{requests.length} requests</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            disabled={isRunning}
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-border">
          <Button onClick={runCollection} disabled={isRunning}>
            {isRunning ? `Running... (${currentIndex + 1}/${requests.length})` : 'Run Collection'}
          </Button>

          {results.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Requests: </span>
                <span className="font-semibold">
                  {successfulRequests}/{results.length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Tests: </span>
                <span className="font-semibold text-green-500">
                  {passedTests}
                </span>
                <span className="text-muted-foreground"> / </span>
                <span className="font-semibold text-red-500">
                  {totalTests - passedTests}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Pass Rate: </span>
                <span className="font-semibold">
                  {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-4">
          {results.length === 0 && !isRunning && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Click "Run Collection" to start</p>
            </div>
          )}

          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                {/* Request Info */}
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-mono font-semibold ${
                    result.response ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {result.request.method}
                  </span>
                  <span className="text-sm font-medium">{result.request.name}</span>
                  {result.response && (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {result.response.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {result.response.time}ms
                      </span>
                    </>
                  )}
                </div>

                {/* Error */}
                {result.error && (
                  <div className="text-sm text-red-500 mb-2">{result.error}</div>
                )}

                {/* Tests */}
                {result.tests.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.tests.map((test, testIndex) => (
                      <div key={testIndex} className="flex items-center gap-2 text-sm">
                        <span className={test.passed ? 'text-green-500' : 'text-red-500'}>
                          {test.passed ? '✓' : '✗'}
                        </span>
                        <span>{test.name}</span>
                        {test.error && (
                          <span className="text-xs text-muted-foreground">- {test.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
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
