import type { FastifyPluginAsync } from 'fastify';
import { getDatabase } from '../db/index.js';
import { UpdateAccountLabelSchema } from '@gistmymail/shared';
import { encryptToken } from '../security/encryption.js';
import { config } from '../config.js';

export const accountsRoutes: FastifyPluginAsync = async (fastify) => {
  // Helper to extract authenticated user ID
  function getUserId(request: any): string | null {
    return request.cookies.session_user_id || null;
  }

  // List accounts for current user
  fastify.get('/api/accounts', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return { accounts: [] };
    }
    const db = await getDatabase();
    const accounts = await db.getAccountsForUser(userId);
    return { accounts };
  });

  // Connect a new account (Demo/Mock or Direct Link)
  fastify.post('/api/accounts/connect-demo', async (request, reply) => {
    let userId = getUserId(request);
    const db = await getDatabase();

    if (!userId) {
      userId = 'usr_demo_01';
      reply.setCookie('session_user_id', userId, {
        path: '/',
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400
      });
    }

    const body = request.body as { email: string; label: string; hasSendPermission?: boolean };

    const accountId = `acc_demo_${Date.now()}`;
    const newAccount = await db.saveAccount({
      id: accountId,
      userId,
      email: body.email || `custom.${Date.now()}@gmail.com`,
      label: body.label || 'Custom',
      googleSub: `sub_${Date.now()}`,
      hasSendPermission: !!body.hasSendPermission,
      isSelectedForDigest: true,
      status: 'connected',
      encryptedRefreshToken: encryptToken('mock_refresh_token_custom')
    });

    return { account: newAccount };
  });

  // Update account label and digest selection
  fastify.put('/api/accounts/:id', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = request.params as { id: string };
    const parseRes = UpdateAccountLabelSchema.safeParse(request.body);

    if (!parseRes.success) {
      return reply.status(400).send({ error: parseRes.error.format() });
    }

    const db = await getDatabase();
    const updated = await db.updateAccountLabel(id, userId, parseRes.data.label, parseRes.data.isSelectedForDigest);
    if (!updated) {
      return reply.status(404).send({ error: 'Account not found or access denied' });
    }

    return { account: updated };
  });

  // Disconnect account
  fastify.delete('/api/accounts/:id', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = request.params as { id: string };

    const db = await getDatabase();
    const success = await db.disconnectAccount(id, userId);
    if (!success) {
      return reply.status(404).send({ error: 'Account not found or access denied' });
    }

    return { success: true };
  });
};
