import type { ConnectedAccount, EmailMessage } from '@gistmymail/shared';
import { getAuthorizedGmailClient } from '../auth/oauth.js';
import { cleanHtmlToText, parseSender, createContentHash } from './normalizer.js';
import { getMockEmailsForAccount } from './mock-data.js';

export async function fetchAccountEmails(
  account: ConnectedAccount,
  encryptedRefreshToken: string | null,
  maxMessages = 15
): Promise<EmailMessage[]> {
  // If encryptedRefreshToken is missing, mock, or Google client credentials aren't set, return mock data
  if (!encryptedRefreshToken || encryptedRefreshToken.startsWith('mock_') || encryptedRefreshToken.includes('mock_refresh_token')) {
    return getMockEmailsForAccount(account.id, account.label);
  }

  try {
    const gmail = await getAuthorizedGmailClient(encryptedRefreshToken);
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxMessages,
      q: 'newer_than:7d'
    });

    const messageHeaders = listRes.data.messages || [];
    if (messageHeaders.length === 0) {
      return [];
    }

    const fetchedMessages: EmailMessage[] = [];

    for (const msgRef of messageHeaders) {
      if (!msgRef.id) continue;
      const detailRes = await gmail.users.messages.get({
        userId: 'me',
        id: msgRef.id,
        format: 'full'
      });

      const msg = detailRes.data;
      const headers = msg.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const fromHeader = getHeader('From');
      const subject = getHeader('Subject') || '(No Subject)';
      const dateHeader = getHeader('Date');
      const receivedAt = dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString();
      const { name: senderName, email: sender } = parseSender(fromHeader);

      // Extract plain text from payload parts
      let rawText = '';
      if (msg.payload?.parts) {
        for (const part of msg.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            rawText += Buffer.from(part.body.data, 'base64').toString('utf8') + '\n';
          } else if (part.mimeType === 'text/html' && part.body?.data && !rawText) {
            rawText += cleanHtmlToText(Buffer.from(part.body.data, 'base64').toString('utf8')) + '\n';
          }
        }
      } else if (msg.payload?.body?.data) {
        rawText = Buffer.from(msg.payload.body.data, 'base64').toString('utf8');
        if (msg.payload.mimeType === 'text/html') {
          rawText = cleanHtmlToText(rawText);
        }
      }

      const cleanedBody = rawText.trim() || msg.snippet || '';

      fetchedMessages.push({
        id: `msg_${account.id}_${msg.id}`,
        accountId: account.id,
        accountLabel: account.label,
        gmailMessageId: msg.id || 'unknown_msg_id',
        threadId: msg.threadId || msg.id || 'unknown_thread_id',
        sender,
        senderName,
        subject,
        snippet: msg.snippet || cleanedBody.slice(0, 150),
        receivedAt,
        cleanedBody,
        gmailUrl: `https://mail.google.com/mail/u/0/#all/${msg.id}`,
        contentHash: createContentHash(cleanedBody)
      });
    }

    return fetchedMessages;
  } catch (err) {
    console.warn(`Failed to fetch real Gmail messages for account ${account.email} (${(err as Error).message}). Falling back to mock data.`);
    return getMockEmailsForAccount(account.id, account.label);
  }
}
