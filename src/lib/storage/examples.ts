import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface RequestExample {
  id: string;
  requestId: string;
  name: string;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Since examples aren't in the DB schema yet, we'll store them in localStorage for now
const EXAMPLES_KEY = 'tinx_examples';

export const examplesService = {
  async getAll(): Promise<RequestExample[]> {
    const data = localStorage.getItem(EXAMPLES_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getByRequestId(requestId: string): Promise<RequestExample[]> {
    const all = await this.getAll();
    return all.filter(ex => ex.requestId === requestId);
  },

  async getById(id: string): Promise<RequestExample | undefined> {
    const all = await this.getAll();
    return all.find(ex => ex.id === id);
  },

  async create(requestId: string, name: string, request: any, response: any): Promise<RequestExample> {
    const example: RequestExample = {
      id: uuidv4(),
      requestId,
      name,
      request,
      response,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const all = await this.getAll();
    all.push(example);
    localStorage.setItem(EXAMPLES_KEY, JSON.stringify(all));
    return example;
  },

  async update(id: string, updates: Partial<RequestExample>): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex(ex => ex.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(EXAMPLES_KEY, JSON.stringify(all));
    }
  },

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(ex => ex.id !== id);
    localStorage.setItem(EXAMPLES_KEY, JSON.stringify(filtered));
  },
};
