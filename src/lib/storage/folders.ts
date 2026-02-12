import { db } from './db';
import type { Folder } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const folderService = {
  async getAll(): Promise<Folder[]> {
    return await db.collections.toArray().then(collections => {
      // For now, we'll store folders in localStorage since they're not in the DB schema
      const stored = localStorage.getItem('tinx_folders');
      return stored ? JSON.parse(stored) : [];
    });
  },

  async getByCollectionId(collectionId: string): Promise<Folder[]> {
    const all = await this.getAll();
    return all.filter(f => f.collectionId === collectionId);
  },

  async getById(id: string): Promise<Folder | undefined> {
    const all = await this.getAll();
    return all.find(f => f.id === id);
  },

  async create(name: string, collectionId: string, parentId?: string): Promise<Folder> {
    const folder: Folder = {
      id: uuidv4(),
      name,
      collectionId,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const all = await this.getAll();
    all.push(folder);
    localStorage.setItem('tinx_folders', JSON.stringify(all));
    return folder;
  },

  async update(id: string, updates: Partial<Folder>): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex(f => f.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates, updatedAt: new Date() };
      localStorage.setItem('tinx_folders', JSON.stringify(all));
    }
  },

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(f => f.id !== id && f.parentId !== id);
    localStorage.setItem('tinx_folders', JSON.stringify(filtered));
  },

  // Get folder hierarchy
  async getFolderTree(collectionId: string): Promise<FolderNode[]> {
    const folders = await this.getByCollectionId(collectionId);
    const rootFolders = folders.filter(f => !f.parentId);

    const buildTree = (parentId?: string): FolderNode[] => {
      return folders
        .filter(f => f.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id),
        }));
    };

    return rootFolders.map(folder => ({
      ...folder,
      children: buildTree(folder.id),
    }));
  },
};

export interface FolderNode extends Folder {
  children: FolderNode[];
}
