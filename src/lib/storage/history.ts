import { db } from './db';
import type { HistoryItem, Request, Response } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const historyService = {
  async getAll(): Promise<HistoryItem[]> {
    return await db.history.orderBy('timestamp').reverse().toArray();
  },

  async getById(id: string): Promise<HistoryItem | undefined> {
    return await db.history.get(id);
  },

  async getRecent(limit: number = 50): Promise<HistoryItem[]> {
    return await db.history.orderBy('timestamp').reverse().limit(limit).toArray();
  },

  async searchByUrl(url: string): Promise<HistoryItem[]> {
    return await db.history
      .filter(item => item.request.url.toLowerCase().includes(url.toLowerCase()))
      .reverse()
      .toArray();
  },

  async searchByMethod(method: string): Promise<HistoryItem[]> {
    return await db.history
      .filter(item => item.request.method === method)
      .reverse()
      .toArray();
  },

  async add(request: Request, response: Response): Promise<HistoryItem> {
    const historyItem: HistoryItem = {
      id: uuidv4(),
      request,
      response,
      timestamp: new Date(),
    };

    await db.history.add(historyItem);
    return historyItem;
  },

  async delete(id: string): Promise<void> {
    await db.history.delete(id);
  },

  async deleteAll(): Promise<void> {
    await db.history.clear();
  },

  async deleteOlderThan(date: Date): Promise<void> {
    const items = await db.history.where('timestamp').below(date).toArray();
    const ids = items.map(item => item.id);
    await db.history.bulkDelete(ids);
  },
};
