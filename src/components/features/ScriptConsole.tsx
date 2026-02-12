import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  args?: any[];
}

interface ScriptConsoleProps {
  logs: ConsoleLog[];
  onClear: () => void;
}

export function ScriptConsole({ logs, onClear }: ScriptConsoleProps) {
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all');

  const filteredLogs = logs.filter(log => filter === 'all' || log.type === filter);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-foreground';
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return '✕';
      case 'warn': return '⚠';
      case 'info': return 'ℹ';
      default: return '›';
    }
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  return (
    <div className="flex flex-col h-full border-t border-border bg-secondary/20">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Console</span>
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs rounded ${
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('log')}
              className={`px-2 py-1 text-xs rounded ${
                filter === 'log' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
              }`}
            >
              Logs ({logs.filter(l => l.type === 'log').length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 text-xs rounded ${
                filter === 'error' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
              }`}
            >
              Errors ({logs.filter(l => l.type === 'error').length})
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`px-2 py-1 text-xs rounded ${
                filter === 'warn' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
              }`}
            >
              Warnings ({logs.filter(l => l.type === 'warn').length})
            </button>
          </div>
        </div>
        <Button onClick={onClear} variant="outline" size="sm">
          Clear
        </Button>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto p-2 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No console output</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-2 py-1 px-2 hover:bg-secondary/50 rounded ${getLogColor(log.type)}`}
              >
                <span className="opacity-50">{getLogIcon(log.type)}</span>
                <span className="flex-1">
                  {log.message}
                  {log.args && log.args.length > 0 && (
                    <div className="ml-4 mt-1 text-xs opacity-75">
                      {log.args.map((arg, i) => (
                        <div key={i}>{formatValue(arg)}</div>
                      ))}
                    </div>
                  )}
                </span>
                <span className="text-xs opacity-50">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Console interceptor for capturing logs
export class ConsoleInterceptor {
  private logs: ConsoleLog[] = [];
  private listeners: ((logs: ConsoleLog[]) => void)[] = [];
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  constructor() {
    this.intercept();
  }

  private intercept() {
    const createInterceptor = (type: 'log' | 'error' | 'warn' | 'info') => {
      return (...args: any[]) => {
        const log: ConsoleLog = {
          id: crypto.randomUUID(),
          type,
          message: args.map(arg => formatValue(arg)).join(' '),
          timestamp: new Date(),
          args,
        };

        this.logs.push(log);
        this.notifyListeners();

        // Call original console method
        this.originalConsole[type](...args);
      };
    };

    console.log = createInterceptor('log');
    console.error = createInterceptor('error');
    console.warn = createInterceptor('warn');
    console.info = createInterceptor('info');
  }

  getLogs(): ConsoleLog[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(listener: (logs: ConsoleLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  restore() {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
  }
}

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export const consoleInterceptor = new ConsoleInterceptor();
