import type { Digest, DigestItem, EmailMessage } from '@gistmymail/shared';
import { getDatabase } from '../db/index.js';
import { fetchAccountEmails } from '../gmail/client.js';
import { getAIProvider, validateAndAggregateItems } from '../ai/index.js';

export async function generateUserDigest(
  userId: string,
  options?: {
    accountIds?: string[];
    maxMessagesPerAccount?: number;
    useMockProvider?: boolean;
  }
): Promise<Digest> {
  const db = await getDatabase();
  const user = await db.findUserById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Load connected accounts
  const allAccounts = await db.getAccountsForUser(userId);
  const selectedAccounts = allAccounts.filter(acc => {
    if (options?.accountIds && options.accountIds.length > 0) {
      return options.accountIds.includes(acc.id);
    }
    return acc.isSelectedForDigest && acc.status === 'connected';
  });

  if (selectedAccounts.length === 0) {
    throw new Error('No active connected accounts selected for digest generation.');
  }

  const aiProvider = getAIProvider(options?.useMockProvider);
  const maxMessages = options?.maxMessagesPerAccount || 15;

  let totalProcessedMessages = 0;
  const aggregatedItems: DigestItem[] = [];
  const seenContentHashes = new Set<string>();

  for (const account of selectedAccounts) {
    const refreshToken = await db.getStoredRefreshToken(account.id);
    const emails: EmailMessage[] = await fetchAccountEmails(account, refreshToken, maxMessages);

    // Save fetched emails to DB for persistence and deduplication
    await db.saveEmailMessages(emails);

    for (const email of emails) {
      // Deduplicate by content hash
      if (seenContentHashes.has(email.contentHash)) {
        continue;
      }
      seenContentHashes.add(email.contentHash);
      totalProcessedMessages++;

      try {
        // Run AI extraction
        const aiResult = await aiProvider.extractEmail(email);
        
        // Run Deterministic Aggregator (verifying evidence quotes in source body)
        const validatedItems = validateAndAggregateItems(email, aiResult.output);
        aggregatedItems.push(...validatedItems);
      } catch (err) {
        console.warn(`Error running AI extraction on email "${email.subject}":`, (err as Error).message);
        // Fallback: create safe summary item without crashing entire digest
        aggregatedItems.push({
          id: `item_err_${email.id}`,
          category: 'important_updates',
          title: email.subject,
          summary: email.snippet || email.cleanedBody.slice(0, 120),
          accountLabel: email.accountLabel,
          accountEmail: email.sender,
          sender: email.sender,
          receivedAt: email.receivedAt,
          actionItem: null,
          deadlineText: null,
          deadlineIso: null,
          isExplicitDeadline: false,
          evidence: { quote: '', verifiedInSource: false },
          gmailUrl: email.gmailUrl,
          priorityScore: 3,
          uncertainties: ['AI extraction encountered error, safe fallback shown.']
        });
      }
    }
  }

  // Sort aggregated items: priorityScore descending, then deadlines first
  aggregatedItems.sort((a, b) => {
    if (a.category === 'top_priority' && b.category !== 'top_priority') return -1;
    if (b.category === 'top_priority' && a.category !== 'top_priority') return 1;
    if (a.deadlineText && !b.deadlineText) return -1;
    if (!a.deadlineText && b.deadlineText) return 1;
    return b.priorityScore - a.priorityScore;
  });

  const deliveryPref = await db.getDeliveryPreference(userId);

  const digest: Digest = {
    id: `digest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    generatedAt: new Date().toISOString(),
    sourceAccountsCount: selectedAccounts.length,
    processedMessagesCount: totalProcessedMessages,
    items: aggregatedItems,
    summaryNote: `Combined ${aggregatedItems.length} actionable items from ${selectedAccounts.length} inboxes.`,
    deliveredAt: null,
    destinationAccountEmail: deliveryPref?.destinationAccountEmail || null,
    deliveryStatus: deliveryPref?.enabled ? 'pending' : 'not_scheduled'
  };

  await db.saveDigest(digest);
  return digest;
}
