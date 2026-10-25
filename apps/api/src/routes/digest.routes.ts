import type { FastifyPluginAsync } from 'fastify';
import { getDatabase } from '../db/index.js';
import { generateUserDigest } from '../digest/generator.js';
import { renderPlainTextDigest, renderHtmlDigest } from '../digest/renderer.js';
import { sendDigestEmail } from '../gmail/sender.js';
import { GenerateDigestRequestSchema } from '@gistmymail/shared';

export const digestRoutes: FastifyPluginAsync = async (fastify) => {
  function getUserId(request: any): string | null {
    return request.cookies.session_user_id || null;
  }

  // Get latest digest
  fastify.get('/api/digest/latest', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return { digest: null };
    }
    const db = await getDatabase();
    const digest = await db.getLatestDigest(userId);
    return { digest };
  });

  // Generate digest on demand
  fastify.post('/api/digest/generate', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.status(401).send({ error: 'Please connect a Gmail account or enter Demo Mode to generate a digest.' });
    }

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
    if (!userId) {
      return reply.status(401).send({ error: 'Please connect a Gmail account or enter Demo Mode to send test emails.' });
    }
    const db = await getDatabase();
    const user = await db.findUserById(userId);
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    const body = (request.body as { destinationAccountId?: string } | undefined);
    let pref = await db.getDeliveryPreference(userId);
    let destAccount = null;

    if (body?.destinationAccountId) {
      destAccount = await db.getAccountById(body.destinationAccountId, userId);
    }

    if (!destAccount && pref?.destinationAccountId) {
      destAccount = await db.getAccountById(pref.destinationAccountId, userId);
    }

    if (!destAccount) {
      const accounts = await db.getAccountsForUser(userId);
      if (accounts.length === 0) {
        return reply.status(400).send({ error: 'No connected Gmail accounts found. Please connect an account first.' });
      }
      destAccount = accounts.find((a) => a.hasSendPermission) || accounts[0];
    }

    // Ensure preference record exists and is synced with destAccount
    if (!pref) {
      pref = {
        userId,
        enabled: true,
        destinationAccountId: destAccount.id,
        destinationAccountEmail: destAccount.email,
        deliveryTime: '07:00',
        timezone: 'America/New_York',
        lastAttemptAt: null,
        lastSuccessAt: null,
        lastError: null
      };
      await db.saveDeliveryPreference(pref);
    } else if (pref.destinationAccountId !== destAccount.id) {
      pref.destinationAccountId = destAccount.id;
      pref.destinationAccountEmail = destAccount.email;
      await db.saveDeliveryPreference(pref);
    }

    let refreshToken = await db.getStoredRefreshToken(destAccount.id);

    // If selected account lacks send permission, try to find another connected account with send permission
    if (!destAccount.hasSendPermission && refreshToken && !refreshToken.startsWith('mock_')) {
      const accounts = await db.getAccountsForUser(userId);
      const sendAccount = accounts.find((a) => a.hasSendPermission);
      if (sendAccount) {
        destAccount = sendAccount;
        refreshToken = await db.getStoredRefreshToken(destAccount.id);
      } else {
        return reply.status(400).send({
          error: `Connected account (${destAccount.email}) lacks Gmail Send permission. Please reconnect your account to grant email delivery access.`
        });
      }
    }

    try {
      // 1. Generate or fetch latest digest
      let digest = await db.getLatestDigest(userId);
      if (!digest) {
        try {
          digest = await generateUserDigest(userId);
        } catch (genErr) {
          return reply.status(400).send({
            error: `Could not synthesize a digest to send: ${(genErr as Error).message}. Please click "Generate Today's Digest" first.`
          });
        }
      }

      // 2. Render text & HTML
      const textContent = renderPlainTextDigest(digest, user.name);
      const htmlContent = renderHtmlDigest(digest, user.name);

      // 3. Send email via authorized Gmail client
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
