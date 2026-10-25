import type {
  User,
  ConnectedAccount,
  EmailMessage,
  Digest,
  DeliveryPreference,
  DeliveryLog
} from '@gistmymail/shared';

export interface DatabaseRepository {
  init(): Promise<void>;
  
  // User management
  findUserById(id: string): Promise<User | null>;
  findUserByGoogleSub(googleSub: string): Promise<User | null>;
  createOrUpdateUser(user: { id: string; email: string; name: string; googleSub: string }): Promise<User>;

  // Connected accounts
  getAccountsForUser(userId: string): Promise<ConnectedAccount[]>;
  getAccountById(id: string, userId: string): Promise<ConnectedAccount | null>;
  saveAccount(account: {
    id: string;
    userId: string;
    email: string;
    label: string;
    googleSub: string;
    hasSendPermission: boolean;
    isSelectedForDigest: boolean;
    status: 'connected' | 'needs_reauth' | 'disconnected';
    encryptedRefreshToken?: string;
  }): Promise<ConnectedAccount>;
  updateAccountLabel(id: string, userId: string, label: string, isSelected?: boolean): Promise<ConnectedAccount | null>;
  disconnectAccount(id: string, userId: string): Promise<boolean>;
  getStoredRefreshToken(accountId: string): Promise<string | null>;

  // Email messages
  saveEmailMessages(messages: EmailMessage[]): Promise<void>;
  getEmailMessages(accountId: string, limit?: number): Promise<EmailMessage[]>;

  // Digests
  saveDigest(digest: Digest): Promise<void>;
  getLatestDigest(userId: string): Promise<Digest | null>;
  getDigestById(id: string, userId: string): Promise<Digest | null>;

  // Delivery
  getDeliveryPreference(userId: string): Promise<DeliveryPreference | null>;
  saveDeliveryPreference(pref: DeliveryPreference): Promise<void>;
  createDeliveryLog(log: DeliveryLog): Promise<void>;
  getDueDeliveries(currentHHMM: string): Promise<{ user: User; pref: DeliveryPreference }[]>;
}
