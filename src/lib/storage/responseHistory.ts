// Response history per request
import type { Response } from '@/types';

const RESPONSE_HISTORY_KEY = 'tinx_response_history';

export interface ResponseHistoryItem {
  id: string;
  requestId: string;
  response: Response;
  timestamp: Date;
}

export const responseHistoryService = {
  getAll(): ResponseHistoryItem[] {
    const stored = localStorage.getItem(RESPONSE_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getByRequestId(requestId: string, limit: number = 10): ResponseHistoryItem[] {
    const all = this.getAll();
    return all
      .filter(item => item.requestId === requestId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  add(requestId: string, response: Response): ResponseHistoryItem {
    const item: ResponseHistoryItem = {
      id: crypto.randomUUID(),
      requestId,
      response,
      timestamp: new Date(),
    };

    const all = this.getAll();
    all.unshift(item);

    // Keep only last 100 responses per request
    const byRequest = new Map<string, number>();
    const filtered = all.filter(item => {
      const count = byRequest.get(item.requestId) || 0;
      if (count < 100) {
        byRequest.set(item.requestId, count + 1);
        return true;
      }
      return false;
    });

    localStorage.setItem(RESPONSE_HISTORY_KEY, JSON.stringify(filtered));
    return item;
  },

  delete(id: string) {
    const all = this.getAll();
    const filtered = all.filter(item => item.id !== id);
    localStorage.setItem(RESPONSE_HISTORY_KEY, JSON.stringify(filtered));
  },

  deleteByRequestId(requestId: string) {
    const all = this.getAll();
    const filtered = all.filter(item => item.requestId !== requestId);
    localStorage.setItem(RESPONSE_HISTORY_KEY, JSON.stringify(filtered));
  },

  clear() {
    localStorage.removeItem(RESPONSE_HISTORY_KEY);
  },
};
