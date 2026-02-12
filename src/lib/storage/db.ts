import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  Collection,
  Environment,
  Request,
  HistoryItem,
  Workspace,
} from '@/types';

export class TinxDatabase extends Dexie {
  workspaces!: Table<Workspace>;
  collections!: Table<Collection>;
  requests!: Table<Request>;
  environments!: Table<Environment>;
  history!: Table<HistoryItem>;

  constructor() {
    super('TinxDB');
    
    this.version(1).stores({
      workspaces: 'id, name, isActive, createdAt',
      collections: 'id, name, createdAt, updatedAt',
      requests: 'id, name, method, collectionId, folderId, createdAt, updatedAt',
      environments: 'id, name, isActive, createdAt, updatedAt',
      history: 'id, timestamp, request.method, request.url',
    });
  }
}

export const db = new TinxDatabase();
