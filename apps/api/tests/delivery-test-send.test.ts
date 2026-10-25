import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { getDatabase } from '../src/db/index.js';
import { encryptToken } from '../src/security/encryption.js';

describe('Delivery Preferences & Test Send Endpoint', () => {
  let app: any;
  const testUserId = 'usr_new_test_user_400_check';

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    const db = await getDatabase();
    await db.init();

    // Create a new user without any seeded delivery preferences
    await db.createOrUpdateUser({
      id: testUserId,
      email: 'alex.test@gmail.com',
      name: 'Alex Test',
      googleSub: 'google_sub_alex_123'
    });
  });

  it('rejects test-send with 400 if user has no connected accounts', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/digest/test-send',
      cookies: {
        session_user_id: testUserId
      }
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toContain('No connected Gmail accounts found');
  });

  it('auto-initializes preferences and sends test digest successfully once an account is connected', async () => {
    const db = await getDatabase();

    // Connect an account for this user
    await db.saveAccount({
      id: 'acc_alex_primary',
      userId: testUserId,
      email: 'alex.test@gmail.com',
      label: 'Personal',
      googleSub: 'google_sub_alex_123',
      hasSendPermission: true,
      isSelectedForDigest: true,
      status: 'connected',
      encryptedRefreshToken: encryptToken('mock_refresh_token_alex')
    });

    // Verify GET /api/delivery/preferences automatically initializes and returns preference
    const prefRes = await app.inject({
      method: 'GET',
      url: '/api/delivery/preferences',
      cookies: {
        session_user_id: testUserId
      }
    });

    expect(prefRes.statusCode).toBe(200);
    const prefBody = JSON.parse(prefRes.body);
    expect(prefBody.preferences).toBeDefined();
    expect(prefBody.preferences.destinationAccountId).toBe('acc_alex_primary');
    expect(prefBody.preferences.destinationAccountEmail).toBe('alex.test@gmail.com');

    // Pre-seed a digest for this user so test-send can dispatch immediately
    await db.saveDigest({
      id: 'dig_alex_test_01',
      userId: testUserId,
      generatedAt: new Date().toISOString(),
      deliveredAt: null,
      deliveryStatus: 'pending',
      sourceAccountsCount: 1,
      processedMessagesCount: 5,
      items: [
        {
          id: 'item_01',
          category: 'action_items',
          title: 'Review Project Deliverables',
          summary: 'Submit final report by 5 PM today.',
          accountLabel: 'Personal',
          accountEmail: 'alex.test@gmail.com',
          sender: 'lead@example.com',
          receivedAt: new Date().toISOString(),
          actionItem: 'Submit report',
          deadlineText: '5 PM today',
          deadlineIso: new Date().toISOString(),
          isExplicitDeadline: true,
          evidence: {
            quote: 'Please submit your final report by 5 PM today.',
            verifiedInSource: true
          },
          gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/msg_01',
          priorityScore: 8,
          uncertainties: []
        }
      ]
    });

    // Test POST /api/digest/test-send
    const sendRes = await app.inject({
      method: 'POST',
      url: '/api/digest/test-send',
      cookies: {
        session_user_id: testUserId
      }
    });

    expect(sendRes.statusCode).toBe(200);
    const sendBody = JSON.parse(sendRes.body);
    expect(sendBody.success).toBe(true);
    expect(sendBody.message).toContain('alex.test@gmail.com');
    expect(sendBody.gmailMessageId).toBeDefined();

    // Verify delivery preference was updated with lastSuccessAt
    const savedPref = await db.getDeliveryPreference(testUserId);
    expect(savedPref).not.toBeNull();
    expect(savedPref?.lastSuccessAt).toBeDefined();
    expect(savedPref?.lastError).toBeNull();
  });

  it('updates delivery preferences successfully via PUT /api/delivery/preferences', async () => {
    const updateRes = await app.inject({
      method: 'PUT',
      url: '/api/delivery/preferences',
      cookies: {
        session_user_id: testUserId
      },
      payload: {
        enabled: true,
        destinationAccountId: 'acc_alex_primary',
        deliveryTime: '09:30',
        timezone: 'Asia/Kolkata'
      }
    });

    expect(updateRes.statusCode).toBe(200);
    const body = JSON.parse(updateRes.body);
    expect(body.preferences.deliveryTime).toBe('09:30');
    expect(body.preferences.timezone).toBe('Asia/Kolkata');
  });
});
