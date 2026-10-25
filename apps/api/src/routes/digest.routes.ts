import type { FastifyPluginAsync } from 'fastify';
import { getDatabase } from '../db/index.js';
import { generateUserDigest } from '../digest/generator.js';
import { renderPlainTextDigest, renderHtmlDigest } from '../digest/renderer.js';
import { sendDigestEmail } from '../gmail/sender.js';
import { GenerateDigestRequestSchema } from '@gistmymail/shared';

export const digestRoutes: FastifyPluginAsync = async (fastify) => {
  function getUserId(request: any): string {
    return request.cookies.session_user_id || 'usr_demo_01';
  }

  // Get latest digest
  fastify.get('/api/digest/latest', async (request, reply) => {
    const userId = getUserId(request);
    const db = await getDatabase();
    const digest = await db.getLatestDigest(userId);
    return { digest };
  });

  // Generate digest on demand
  fastify.post('/api/digest/generate', async (request, reply) => {
    const userId = getUserId(request);
    const parseRes = GenerateDigestRequestSchema.safeParse(request.body || {});

    if (!parseRes.success) {
      return reply.status(400).send({ error: parseRes.error.format() });
    }

    try {
      const digest = await generateUserDigest(userId, {
        accountIds: parseRes.data.accountIds,
        maxMessagesPerAccount: parseRes.data.maxMessagesPerAccount,
        useMockProvider: parseRes.data.useMockProvider
      });

      return { digest };
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });

  // Send a test digest email immediately to the configured destination account
  fastify.post('/api/digest/test-send', async (request, reply) => {
    const userId = getUserId(request);
    const db = await getDatabase();
    const user = await db.findUserById(userId);
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    const pref = await db.getDeliveryPreference(userId);
    if (!pref || !pref.destinationAccountId) {
      return reply.status(400).send({ error: 'No destination Gmail account selected in delivery preferences.' });
    }

    const destAccount = await db.getAccountById(pref.destinationAccountId, userId);
    if (!destAccount) {
      return reply.status(400).send({ error: 'Selected destination account is not connected.' });
    }

    try {
      // 1. Generate or fetch latest digest
      let digest = await db.getLatestDigest(userId);
      if (!digest) {
        digest = await generateUserDigest(userId);
      }

      // 2. Render text & HTML
      const textContent = renderPlainTextDigest(digest, user.name);
      const htmlContent = renderHtmlDigest(digest, user.name);

      // 3. Send email via authorized Gmail client
      const refreshToken = await db.getStoredRefreshToken(destAccount.id);
      const sendResult = await sendDigestEmail({
        destinationEmail: destAccount.email,
        subject: `[Test] Your GistMyMail Daily Digest — ${new Date().toLocaleDateString()}`,
        textContent,
        htmlContent,
        senderAccount: destAccount,
        encryptedRefreshToken: refreshToken
      });

      const nowIso = new Date().toISOString();

      if (sendResult.success) {
        digest.deliveredAt = nowIso;
        digest.deliveryStatus = 'delivered';
        await db.saveDigest(digest);

        pref.lastSuccessAt = nowIso;
        pref.lastAttemptAt = nowIso;
        pref.lastError = null;
        await db.saveDeliveryPreference(pref);

        await db.createDeliveryLog({
          id: `log_test_${Date.now()}`,
          userId,
          digestId: digest.id,
          destinationEmail: destAccount.email,
          status: 'success',
          attemptCount: 1,
          gmailMessageId: sendResult.gmailMessageId,
          errorMessage: null,
          createdAt: nowIso
        });

        return {
          success: true,
          message: `Digest email sent successfully to ${destAccount.email}`,
          gmailMessageId: sendResult.gmailMessageId
        };
      } else {
        return reply.status(500).send({
          success: false,
          error: sendResult.error || 'Failed to send test email'
        });
      }
    } catch (err) {
      return reply.status(500).send({ error: (err as Error).message });
    }
  });
};
