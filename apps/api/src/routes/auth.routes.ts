import type { FastifyPluginAsync } from 'fastify';
import { generateGoogleAuthUrl, exchangeOAuthCode } from '../auth/oauth.js';
import { getDatabase } from '../db/index.js';
import { config } from '../config.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Start OAuth
  fastify.get('/auth/google', async (request, reply) => {
    const requestSend = (request.query as { send?: string })?.send === 'true';
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    reply.setCookie('oauth_state', state, {
      path: '/',
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });

    const url = generateGoogleAuthUrl(state, requestSend);
    return reply.redirect(url);
  });

  // OAuth Callback
  fastify.get('/auth/google/callback', async (request, reply) => {
    const { code, state, error } = request.query as { code?: string; state?: string; error?: string };

    if (error) {
      return reply.redirect(`${config.APP_BASE_URL}?auth_error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return reply.status(400).send({ error: 'Missing authorization code from Google OAuth' });
    }

    const savedState = request.cookies.oauth_state;
    if (savedState && state && savedState !== state) {
      return reply.status(403).send({ error: 'OAuth state mismatch (potential CSRF attack)' });
    }

    try {
      const tokenData = await exchangeOAuthCode(code);
      const db = await getDatabase();

      // Create or update user
      const user = await db.createOrUpdateUser({
        id: `usr_${tokenData.googleSub}`,
        email: tokenData.email,
        name: tokenData.name,
        googleSub: tokenData.googleSub
      });

      // Save connected account
      await db.saveAccount({
        id: `acc_${tokenData.googleSub}`,
        userId: user.id,
        email: tokenData.email,
        label: 'Personal',
        googleSub: tokenData.googleSub,
        hasSendPermission: tokenData.hasSendScope,
        isSelectedForDigest: true,
        status: 'connected',
        encryptedRefreshToken: tokenData.encryptedRefreshToken
      });

      // Set application session cookie
      reply.setCookie('session_user_id', user.id, {
        path: '/',
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 7 // 7 days
      });

      return reply.redirect(`${config.APP_BASE_URL}?connected=true`);
    } catch (err) {
      console.error('Error exchanging OAuth code:', err);
      return reply.redirect(`${config.APP_BASE_URL}?auth_error=${encodeURIComponent((err as Error).message)}`);
    }
  });

  // Get current user identity
  fastify.get('/api/me', async (request, reply) => {
    const userId = request.cookies.session_user_id || 'usr_demo_01'; // Default to demo user if unauthenticated
    const db = await getDatabase();
    const user = await db.findUserById(userId);
    if (!user) {
      return reply.status(401).send({ error: 'User not authenticated' });
    }
    return { user };
  });

  // Logout
  fastify.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('session_user_id', { path: '/' });
    return { success: true };
  });
};
