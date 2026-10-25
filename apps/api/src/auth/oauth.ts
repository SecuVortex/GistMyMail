import { google } from 'googleapis';
import { config } from '../config.js';
import { encryptToken, decryptToken } from '../security/encryption.js';

export const BASE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly'
];

export const SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_REDIRECT_URI
  );
}

export function generateGoogleAuthUrl(state: string, requestSendScope = false): string {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    // If not configured, provide a dev/mock callback link
    return `${config.API_BASE_URL}/auth/google/callback?code=mock_oauth_code&state=${encodeURIComponent(state)}`;
  }

  const oauth2Client = getOAuth2Client();
  const scopes = requestSendScope ? [...BASE_SCOPES, SEND_SCOPE] : BASE_SCOPES;

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent select_account',
    scope: scopes,
    state
  });
}

export async function exchangeOAuthCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  encryptedRefreshToken: string;
  googleSub: string;
  email: string;
  name: string;
  hasSendScope: boolean;
}> {
  if (code === 'mock_oauth_code' || !config.GOOGLE_CLIENT_ID) {
    // Development fallback mock identity
    const mockEmail = 'lakshya.demo@gmail.com';
    return {
      accessToken: 'mock_access_token_xyz',
      refreshToken: 'mock_refresh_token_123',
      encryptedRefreshToken: encryptToken('mock_refresh_token_123'),
      googleSub: 'mock_sub_999999999',
      email: mockEmail,
      name: 'Lakshya Demo',
      hasSendScope: true
    };
  }

  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  if (!userInfo.data.id || !userInfo.data.email) {
    throw new Error('Google OAuth failed to return required user identity (id or email)');
  }

  const grantedScope = tokens.scope || '';
  const hasSendScope = grantedScope.includes('gmail.send');

  return {
    accessToken: tokens.access_token || '',
    refreshToken: tokens.refresh_token || null,
    encryptedRefreshToken: tokens.refresh_token ? encryptToken(tokens.refresh_token) : '',
    googleSub: userInfo.data.id,
    email: userInfo.data.email,
    name: userInfo.data.name || userInfo.data.email.split('@')[0],
    hasSendScope
  };
}

export async function getAuthorizedGmailClient(encryptedRefreshToken: string) {
  const plainRefreshToken = decryptToken(encryptedRefreshToken);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: plainRefreshToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}
