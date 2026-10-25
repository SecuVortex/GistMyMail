import type { FastifyPluginAsync } from 'fastify';
import { getDatabase } from '../db/index.js';
import { UpdateDeliveryPreferencesSchema } from '@gistmymail/shared';

export const deliveryRoutes: FastifyPluginAsync = async (fastify) => {
  function getUserId(request: any): string {
    return request.cookies.session_user_id || 'usr_demo_01';
  }

  // Get delivery preferences
  fastify.get('/api/delivery/preferences', async (request, reply) => {
    const userId = getUserId(request);
    const db = await getDatabase();
    const pref = await db.getDeliveryPreference(userId);
    return { preferences: pref };
  });

  // Update delivery preferences
  fastify.put('/api/delivery/preferences', async (request, reply) => {
    const userId = getUserId(request);
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
