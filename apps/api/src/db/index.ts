import { config } from '../config.js';
import type { DatabaseRepository } from './interface.js';
import { MemoryDatabaseRepository } from './memory.js';
import { PostgresDatabaseRepository } from './postgres.js';

let dbInstance: DatabaseRepository | null = null;

export async function getDatabase(): Promise<DatabaseRepository> {
  if (dbInstance) return dbInstance;

  if (config.DATABASE_URL && config.DATABASE_URL.trim() !== '') {
    try {
      console.log('Connecting to PostgreSQL database...');
      const pgDb = new PostgresDatabaseRepository(config.DATABASE_URL);
      await pgDb.init();
      console.log('PostgreSQL database connected and initialized.');
      dbInstance = pgDb;
      return dbInstance;
    } catch (err) {
      console.warn('Failed to connect to PostgreSQL. Falling back to in-memory store:', (err as Error).message);
    }
  }

  console.log('Initializing in-memory database store (zero external dependencies)...');
  const memDb = new MemoryDatabaseRepository();
  await memDb.init();
  dbInstance = memDb;
  return dbInstance;
}
