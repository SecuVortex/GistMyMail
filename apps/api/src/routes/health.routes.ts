import type { FastifyPluginAsync } from 'fastify';
import { getDatabase } from '../db/index.js';
import { config } from '../config.js';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    let dbStatus = 'healthy';
    try {
      const db = await getDatabase();
      const accounts = await db.getAccountsForUser('usr_demo_01');
      dbStatus = `connected (${accounts.length} accounts indexed)`;
    } catch (err) {
      dbStatus = `error: ${(err as Error).message}`;
    }

    return {
      status: 'ok',
      service: 'GistMyMail API',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      aiProvider: config.AI_PROVIDER,
      aiModel: config.AI_MODEL,
      scheduler: config.SCHEDULER_ENABLED ? 'running' : 'disabled'
    };
  });
};
