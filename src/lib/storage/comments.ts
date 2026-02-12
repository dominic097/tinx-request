import { v4 as uuidv4 } from 'uuid';

export interface Comment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const COMMENTS_KEY = 'tinx_comments';

export const commentsService = {
  async getAll(): Promise<Comment[]> {
    const data = localStorage.getItem(COMMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getByRequestId(requestId: string): Promise<Comment[]> {
    const all = await this.getAll();
    return all.filter(c => c.requestId === requestId);
  },

  async create(requestId: string, userId: string, userName: string, content: string): Promise<Comment> {
    const comment: Comment = {
      id: uuidv4(),
      requestId,
      userId,
      userName,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const all = await this.getAll();
    all.push(comment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    return comment;
  },

  async update(id: string, content: string): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex(c => c.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], content, updatedAt: new Date() };
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    }
  },

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(c => c.id !== id);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
  },
};
