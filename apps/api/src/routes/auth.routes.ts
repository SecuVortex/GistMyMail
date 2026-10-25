import type { FastifyPluginAsync } from 'fastify';
import { generateGoogleAuthUrl, exchangeOAuthCode } from '../auth/oauth.js';
import { getDatabase } from '../db/index.js';
import { config } from '../config.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Start OAuth
  fastify.get('/auth/google', async (request, reply) => {
    const query = request.query as { send?: string; link?: string; link_user?: string };
    const requestSend = query?.send !== 'false';

    // Determine if this OAuth is linking to an existing user session or an explicit target user ID
    const linkingUserId = query?.link_user || request.cookies.session_user_id || null;

    const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const stateObj = {
      nonce,
      linkingUserId: linkingUserId || undefined
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url');
    
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

    // Parse state data to extract linkingUserId if present
    let linkingUserId: string | null = null;
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
        if (decoded && typeof decoded.linkingUserId === 'string') {
          linkingUserId = decoded.linkingUserId;
        }
      } catch {
        // Fallback for legacy plain state strings
      }
    }

    // Fallback to cookie if state didn't carry it
    if (!linkingUserId && request.cookies.session_user_id) {
      linkingUserId = request.cookies.session_user_id;
    }

    try {
      const tokenData = await exchangeOAuthCode(code);
      const db = await getDatabase();

      let targetUser = null;
      if (linkingUserId) {
        targetUser = await db.findUserById(linkingUserId);
      }

      // If no valid linking user found, create or update as primary user
      if (!targetUser) {
        targetUser = await db.createOrUpdateUser({
          id: `usr_${tokenData.googleSub}`,
          email: tokenData.email,
          name: tokenData.name,
          googleSub: tokenData.googleSub
        });
      }

      // Check existing accounts for targetUser to determine label and duplicate check
      const existingAccounts = await db.getAccountsForUser(targetUser.id);
      const existingAcc = existingAccounts.find(
        a => a.googleSub === tokenData.googleSub || a.email.toLowerCase() === tokenData.email.toLowerCase()
      );

      // Determine label: if first account -> Personal, second -> Business, third -> Clients
      let defaultLabel = 'Personal';
      if (existingAccounts.length === 1 && !existingAcc) defaultLabel = 'Business';
      else if (existingAccounts.length >= 2 && !existingAcc) defaultLabel = 'Clients';

      const accountId = existingAcc ? existingAcc.id : `acc_${tokenData.googleSub}`;

      // Save connected account attached to targetUser
      await db.saveAccount({
        id: accountId,
        userId: targetUser.id,
        email: tokenData.email,
        label: existingAcc ? existingAcc.label : defaultLabel,
        googleSub: tokenData.googleSub,
        hasSendPermission: tokenData.hasSendScope,
        isSelectedForDigest: true,
        status: 'connected',
        encryptedRefreshToken: tokenData.encryptedRefreshToken
      });

      // Auto-initialize delivery preferences if not yet configured
      const existingPref = await db.getDeliveryPreference(targetUser.id);
      if (!existingPref || !existingPref.destinationAccountId) {
        await db.saveDeliveryPreference({
          userId: targetUser.id,
          enabled: true,
          destinationAccountId: accountId,
          destinationAccountEmail: tokenData.email,
          deliveryTime: '07:00',
          timezone: 'America/New_York',
          lastAttemptAt: null,
          lastSuccessAt: null,
          lastError: null
        });
      }

      // Set application session cookie for targetUser
      reply.setCookie('session_user_id', targetUser.id, {
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
    const userId = request.cookies.session_user_id;
    if (!userId) {
      return { user: null, isAuthenticated: false, isDemo: false };
    }
    const db = await getDatabase();
    const user = await db.findUserById(userId);
    if (!user) {
      reply.clearCookie('session_user_id', { path: '/' });
      return { user: null, isAuthenticated: false, isDemo: false };
    }
    return {
      user,
      isAuthenticated: true,
      isDemo: user.id === 'usr_demo_01' || user.id.startsWith('usr_mock_')
    };
  });

  // Explicit demo session starter (for hackathon / demo walkthroughs)
  fastify.post('/auth/demo-session', async (request, reply) => {
    const db = await getDatabase();
    await db.init();
    const demoUser = await db.findUserById('usr_demo_01');
    if (!demoUser) {
      return reply.status(500).send({ error: 'Failed to initialize demo session' });
    }

    reply.setCookie('session_user_id', demoUser.id, {
      path: '/',
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    });

    return { success: true, user: demoUser, isDemo: true };
  });

  // Logout
  fastify.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('session_user_id', { path: '/' });
    reply.clearCookie('oauth_state', { path: '/' });
    return { success: true };
  });
};
