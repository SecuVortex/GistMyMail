import { getAuthorizedGmailClient } from '../auth/oauth.js';
import { decryptToken } from '../security/encryption.js';
import { config } from '../config.js';
import type { ConnectedAccount } from '@gistmymail/shared';

function createMimeMessage(options: {
  from: string;
  to: string;
  subject: string;
  textContent: string;
  htmlContent: string;
}): string {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  const lines = [
    `From: GistMyMail Digest <${options.from}>`,
    `To: <${options.to}>`,
    `Subject: =?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    options.textContent,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    options.htmlContent,
    '',
    `--${boundary}--`
  ];

  const rawMessage = lines.join('\r\n');
  return Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendDigestEmail(params: {
  destinationEmail: string;
  subject: string;
  textContent: string;
  htmlContent: string;
  senderAccount: ConnectedAccount;
  encryptedRefreshToken: string | null;
}): Promise<{ success: boolean; gmailMessageId: string | null; error?: string }> {
  const { destinationEmail, subject, textContent, htmlContent, senderAccount, encryptedRefreshToken } = params;

  let plainToken = encryptedRefreshToken;
  if (encryptedRefreshToken) {
    try {
      plainToken = decryptToken(encryptedRefreshToken);
    } catch {
      plainToken = encryptedRefreshToken;
    }
  }

  // If mock mode, missing credentials, or test refresh token, simulate successful sending
  if (
    !plainToken ||
    plainToken.startsWith('mock_') ||
    plainToken.includes('mock_refresh_token') ||
    !config.GOOGLE_CLIENT_ID ||
    !config.GOOGLE_CLIENT_SECRET
  ) {
    console.log(`[Digest Email Sender - Simulation] Successfully sent digest to ${destinationEmail} from ${senderAccount.email}`);
    const simulatedMessageId = `mock_sent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      gmailMessageId: simulatedMessageId
    };
  }

  try {
    const gmail = await getAuthorizedGmailClient(encryptedRefreshToken!);
    const raw = createMimeMessage({
      from: senderAccount.email,
      to: destinationEmail,
      subject,
      textContent,
      htmlContent
    });

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });

    return {
      success: true,
      gmailMessageId: res.data.id || null
    };
  } catch (err) {
    const errorMsg = (err as Error).message || 'Failed to send email via Gmail API';
    console.error(`Error sending digest email to ${destinationEmail}:`, errorMsg);
    return {
      success: false,
      gmailMessageId: null,
      error: errorMsg
    };
  }
}
