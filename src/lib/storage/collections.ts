import { db } from './db';
import { Collection, Folder } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const collectionService = {
  async getAll(): Promise<Collection[]> {
    return await db.collections.toArray();
  },

  async getById(id: string): Promise<Collection | undefined> {
    return await db.collections.get(id);
  },

  async create(
    name: string,
    description?: string
  ): Promise<Collection> {
    const collection: Collection = {
      id: uuidv4(),
      name,
      description,
      requests: [],
      folders: [],
      variables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collections.add(collection);
    return collection;
  },

  async update(id: string, updates: Partial<Collection>): Promise<void> {
    await db.collections.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async delete(id: string): Promise<void> {
    // Delete all requests in this collection
    const requests = await db.requests.where('collectionId').equals(id).toArray();
    await db.requests.bulkDelete(requests.map(r => r.id));
    
    // Delete the collection
    await db.collections.delete(id);
  },

  async addFolder(collectionId: string, folder: Folder): Promise<void> {
    const collection = await db.collections.get(collectionId);
    if (collection) {
      collection.folders.push(folder);
      collection.updatedAt = new Date();
      await db.collections.put(collection);
    }
  },

  async removeFolder(collectionId: string, folderId: string): Promise<void> {
    const collection = await db.collections.get(collectionId);
    if (collection) {
      collection.folders = collection.folders.filter(f => f.id !== folderId);
      collection.updatedAt = new Date();
      await db.collections.put(collection);
    }
  },
};
