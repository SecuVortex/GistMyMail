import type { FastifyPluginAsync } from 'fastify';
import { getDatabase } from '../db/index.js';
import { UpdateDeliveryPreferencesSchema } from '@gistmymail/shared';

export const deliveryRoutes: FastifyPluginAsync = async (fastify) => {
  function getUserId(request: any): string | null {
    return request.cookies.session_user_id || null;
  }

  // Get delivery preferences
  fastify.get('/api/delivery/preferences', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return { preferences: null };
    }
    const db = await getDatabase();
    let pref = await db.getDeliveryPreference(userId);
    if (!pref || !pref.destinationAccountId) {
      const accounts = await db.getAccountsForUser(userId);
      if (accounts.length > 0) {
        const defaultAccount = accounts.find((a) => a.hasSendPermission) || accounts[0];
        pref = {
          userId,
          enabled: pref?.enabled ?? true,
          destinationAccountId: defaultAccount.id,
          destinationAccountEmail: defaultAccount.email,
          deliveryTime: pref?.deliveryTime ?? '07:00',
          timezone: pref?.timezone ?? 'America/New_York',
          lastAttemptAt: pref?.lastAttemptAt ?? null,
          lastSuccessAt: pref?.lastSuccessAt ?? null,
          lastError: pref?.lastError ?? null
        };
        await db.saveDeliveryPreference(pref);
      }
    }
    return { preferences: pref };
  });

  // Update delivery preferences
  fastify.put('/api/delivery/preferences', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.status(401).send({ error: 'Please connect a Gmail account or enter Demo Mode to update delivery preferences.' });
    }
    const parseRes = UpdateDeliveryPreferencesSchema.safeParse(request.body);

    if (!parseRes.success) {
      return reply.status(400).send({ error: parseRes.error.format() });
    }

    const db = await getDatabase();
    let destEmail: string | null = null;
    if (parseRes.data.destinationAccountId) {
      const destAccount = await db.getAccountById(parseRes.data.destinationAccountId, userId);
      if (!destAccount) {
        return reply.status(400).send({ error: 'Selected destination account not found' });
      }
      destEmail = destAccount.email;
    }

    const currentPref = await db.getDeliveryPreference(userId);

    const updated = {
      userId,
      enabled: parseRes.data.enabled,
      destinationAccountId: parseRes.data.destinationAccountId,
      destinationAccountEmail: destEmail,
      deliveryTime: parseRes.data.deliveryTime,
      timezone: parseRes.data.timezone,
      lastAttemptAt: currentPref?.lastAttemptAt || null,
      lastSuccessAt: currentPref?.lastSuccessAt || null,
      lastError: currentPref?.lastError || null
    };

    await db.saveDeliveryPreference(updated);
    return { preferences: updated };
  });
};
