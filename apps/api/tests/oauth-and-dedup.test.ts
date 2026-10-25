import { describe, it, expect } from 'vitest';
import { getDatabase } from '../src/db/index.js';
import { generateUserDigest } from '../src/digest/generator.js';
import { encryptToken, decryptToken } from '../src/security/encryption.js';

describe('OAuth Security & Multi-Inbox Deduplication', () => {
  it('encrypts and decrypts OAuth refresh tokens using AES-256-GCM', () => {
    const originalToken = '1//0gA_sample_google_refresh_token_very_secret_xyz123';
    const encrypted = encryptToken(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(encrypted).toContain(':'); // iv:authTag:cipher

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('generates a combined digest from multiple selected inboxes and ignores deselected accounts', async () => {
    const db = await getDatabase();
    await db.init();

    // Default demo user has 2 accounts: College (acc_college_01) and Business (acc_business_02)
    const accounts = await db.getAccountsForUser('usr_demo_01');
    expect(accounts.length).toBe(2);

    // Ensure both are selected initially
    await db.updateAccountLabel('acc_college_01', 'usr_demo_01', 'College', true);
    await db.updateAccountLabel('acc_business_02', 'usr_demo_01', 'Business', true);

    // Generate digest for both accounts
    const digestBoth = await generateUserDigest('usr_demo_01', { useMockProvider: true });
    expect(digestBoth.sourceAccountsCount).toBe(2);
    expect(digestBoth.items.length).toBeGreaterThan(2);

    // Verify both account labels appear in items
    const labels = new Set(digestBoth.items.map(i => i.accountLabel));
    expect(labels.has('College')).toBe(true);
    expect(labels.has('Business')).toBe(true);

    // Deselect College account
    await db.updateAccountLabel('acc_college_01', 'usr_demo_01', 'College', false);

    // Generate digest again
    const digestOne = await generateUserDigest('usr_demo_01', { useMockProvider: true });
    expect(digestOne.sourceAccountsCount).toBe(1);

    const labelsAfter = new Set(digestOne.items.map(i => i.accountLabel));
    expect(labelsAfter.has('College')).toBe(false);
    expect(labelsAfter.has('Business')).toBe(true);
  });
});
