import { db } from './db';
import type { Environment, Variable } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const environmentService = {
  async getAll(): Promise<Environment[]> {
    return await db.environments.toArray();
  },

  async getById(id: string): Promise<Environment | undefined> {
    return await db.environments.get(id);
  },

  async getActive(): Promise<Environment | undefined> {
    return await db.environments.where('isActive').equals(1).first();
  },

  async create(name: string): Promise<Environment> {
    const environment: Environment = {
      id: uuidv4(),
      name,
      variables: [],
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.environments.add(environment);
    return environment;
  },

  async update(id: string, updates: Partial<Environment>): Promise<void> {
    await db.environments.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.environments.delete(id);
  },

  async setActive(id: string): Promise<void> {
    // Deactivate all environments
    const all = await db.environments.toArray();
    await Promise.all(
      all.map(env =>
        db.environments.update(env.id, { isActive: false })
      )
    );

    // Activate the selected one
    await db.environments.update(id, { isActive: true });
  },

  async addVariable(environmentId: string, variable: Variable): Promise<void> {
    const environment = await db.environments.get(environmentId);
    if (environment) {
      environment.variables.push(variable);
      environment.updatedAt = new Date();
      await db.environments.put(environment);
    }
  },

  async updateVariable(
    environmentId: string,
    variableId: string,
    updates: Partial<Variable>
  ): Promise<void> {
    const environment = await db.environments.get(environmentId);
    if (environment) {
      const varIndex = environment.variables.findIndex(v => v.id === variableId);
      if (varIndex !== -1) {
        environment.variables[varIndex] = {
          ...environment.variables[varIndex],
          ...updates,
        };
        environment.updatedAt = new Date();
        await db.environments.put(environment);
      }
    }
  },

  async removeVariable(environmentId: string, variableId: string): Promise<void> {
    const environment = await db.environments.get(environmentId);
    if (environment) {
      environment.variables = environment.variables.filter(
        v => v.id !== variableId
      );
      environment.updatedAt = new Date();
      await db.environments.put(environment);
    }
  },
};
