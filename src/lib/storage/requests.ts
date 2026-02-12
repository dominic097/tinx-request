import { db } from './db';
import type { Request } from '@/types';
import { HttpMethod } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const requestService = {
  async getAll(): Promise<Request[]> {
    return await db.requests.toArray();
  },

  async getById(id: string): Promise<Request | undefined> {
    return await db.requests.get(id);
  },

  async getByCollection(collectionId: string): Promise<Request[]> {
    return await db.requests.where('collectionId').equals(collectionId).toArray();
  },

  async create(
    name: string,
    method: HttpMethod,
    url: string,
    collectionId?: string
  ): Promise<Request> {
    const request: Request = {
      id: uuidv4(),
      name,
      method,
      url,
      headers: [],
      params: [],
      pathVariables: [],
      collectionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.requests.add(request);
    return request;
  },

  async update(id: string, updates: Partial<Request>): Promise<void> {
    await db.requests.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.requests.delete(id);
  },

  async duplicate(id: string): Promise<Request> {
    const original = await db.requests.get(id);
    if (!original) {
      throw new Error('Request not found');
    }

    const duplicate: Request = {
      ...original,
      id: uuidv4(),
      name: `${original.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.requests.add(duplicate);
    return duplicate;
  },
};
