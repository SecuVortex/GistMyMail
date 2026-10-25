import { getDatabase } from '../db/index.js';
import { generateUserDigest } from '../digest/generator.js';
import { renderPlainTextDigest, renderHtmlDigest } from '../digest/renderer.js';
import { sendDigestEmail } from '../gmail/sender.js';
import type { DeliveryPreference, User } from '@gistmymail/shared';

let schedulerInterval: NodeJS.Timeout | null = null;

export async function processDueDelivery(user: User, pref: DeliveryPreference): Promise<void> {
  const db = await getDatabase();
  console.log(`[Scheduler] Processing scheduled delivery for user ${user.email} (Destination: ${pref.destinationAccountEmail})`);

  try {
    // Check if an account exists for destination
    if (!pref.destinationAccountId) {
      console.warn(`[Scheduler] User ${user.email} has delivery enabled but no destination account selected.`);
      return;
    }

    const destinationAccount = await db.getAccountById(pref.destinationAccountId, user.id);
    if (!destinationAccount) {
      console.warn(`[Scheduler] Destination account ${pref.destinationAccountId} not found.`);
      return;
    }

    // Generate digest
    const digest = await generateUserDigest(user.id);
    const textContent = renderPlainTextDigest(digest, user.name);
    const htmlContent = renderHtmlDigest(digest, user.name);

    const refreshToken = await db.getStoredRefreshToken(destinationAccount.id);

    // Send email
    const sendResult = await sendDigestEmail({
      destinationEmail: destinationAccount.email,
      subject: `Your GistMyMail Daily Digest — ${new Date().toLocaleDateString()}`,
      textContent,
      htmlContent,
      senderAccount: destinationAccount,
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
        id: `log_${Date.now()}`,
        userId: user.id,
        digestId: digest.id,
        destinationEmail: destinationAccount.email,
        status: 'success',
        attemptCount: 1,
        gmailMessageId: sendResult.gmailMessageId,
        errorMessage: null,
        createdAt: nowIso
      });

      console.log(`[Scheduler] Successfully delivered digest to ${destinationAccount.email}`);
    } else {
      digest.deliveryStatus = 'failed';
      await db.saveDigest(digest);

      pref.lastAttemptAt = nowIso;
      pref.lastError = sendResult.error || 'Unknown send failure';
      await db.saveDeliveryPreference(pref);

      await db.createDeliveryLog({
        id: `log_${Date.now()}`,
        userId: user.id,
        digestId: digest.id,
        destinationEmail: destinationAccount.email,
        status: 'failed',
        attemptCount: 1,
        gmailMessageId: null,
        errorMessage: sendResult.error || 'Unknown send failure',
        createdAt: nowIso
      });

      console.error(`[Scheduler] Failed to deliver digest: ${sendResult.error}`);
    }
  } catch (err) {
    console.error(`[Scheduler] Exception during scheduled digest delivery for ${user.email}:`, (err as Error).message);
  }
}

export function startDeliveryScheduler(): void {
  if (schedulerInterval) return;

  console.log('[Scheduler] Background delivery scheduler started (checking every minute)...');
  
  // Run check every minute
  schedulerInterval = setInterval(async () => {
    try {
      const now = new Date();
      // Format current HH:mm
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hours}:${minutes}`;

      const db = await getDatabase();
      const dueDeliveries = await db.getDueDeliveries(currentHHMM);

      for (const { user, pref } of dueDeliveries) {
        // Prevent duplicate sending if already sent today in the last hour
        if (pref.lastSuccessAt) {
          const lastSuccess = new Date(pref.lastSuccessAt);
          const diffMinutes = (now.getTime() - lastSuccess.getTime()) / (1000 * 60);
          if (diffMinutes < 55) {
            continue; // already sent for this delivery slot
          }
        }
        await processDueDelivery(user, pref);
      }
    } catch (err) {
      console.error('[Scheduler] Error in scheduler tick:', (err as Error).message);
    }
  }, 60000);
}

export function stopDeliveryScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Background delivery scheduler stopped.');
  }
}
