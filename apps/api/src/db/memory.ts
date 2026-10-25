import type {
  User,
  ConnectedAccount,
  EmailMessage,
  Digest,
  DeliveryPreference,
  DeliveryLog
} from '@gistmymail/shared';
import type { DatabaseRepository } from './interface.js';

export class MemoryDatabaseRepository implements DatabaseRepository {
  private users: Map<string, User> = new Map();
  private accounts: Map<string, ConnectedAccount> = new Map();
  private accountTokens: Map<string, string> = new Map(); // accountId -> encryptedRefreshToken
  private messages: Map<string, EmailMessage> = new Map(); // id -> EmailMessage
  private digests: Map<string, Digest> = new Map(); // id -> Digest
  private preferences: Map<string, DeliveryPreference> = new Map(); // userId -> DeliveryPreference
  private logs: DeliveryLog[] = [];

  async init(): Promise<void> {
    // Seed default demo user and accounts for instant testing if empty
    if (this.users.size === 0) {
      const demoUser: User = {
        id: 'usr_demo_01',
        email: 'demo.student@gmail.com',
        name: 'Lakshya Agarwal',
        googleSub: 'google_sub_demo_123',
        createdAt: new Date().toISOString()
      };
      this.users.set(demoUser.id, demoUser);

      // Account 1: College
      const accCollege: ConnectedAccount = {
        id: 'acc_college_01',
        userId: demoUser.id,
        email: 'lakshya.college@gmail.com',
        label: 'College',
        googleSub: 'google_sub_college',
        hasSendPermission: false,
        isSelectedForDigest: true,
        status: 'connected',
        lastSyncAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      this.accounts.set(accCollege.id, accCollege);

      // Account 2: Business & Clients
      const accBusiness: ConnectedAccount = {
        id: 'acc_business_02',
        userId: demoUser.id,
        email: 'lakshya.tech@gmail.com',
        label: 'Business',
        googleSub: 'google_sub_business',
        hasSendPermission: true,
        isSelectedForDigest: true,
        status: 'connected',
        lastSyncAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      this.accounts.set(accBusiness.id, accBusiness);

      // Default Delivery Preference
      this.preferences.set(demoUser.id, {
        userId: demoUser.id,
        enabled: true,
        destinationAccountId: accBusiness.id,
        destinationAccountEmail: accBusiness.email,
        deliveryTime: '08:00',
        timezone: 'Asia/Kolkata',
        lastAttemptAt: null,
        lastSuccessAt: null,
        lastError: null
      });
    }
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findUserByGoogleSub(googleSub: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.googleSub === googleSub) return user;
    }
    return null;
  }

  async createOrUpdateUser(userData: { id: string; email: string; name: string; googleSub: string }): Promise<User> {
    let existing = await this.findUserByGoogleSub(userData.googleSub);
    if (!existing) {
      existing = {
        ...userData,
        createdAt: new Date().toISOString()
      };
    } else {
      existing.email = userData.email;
      existing.name = userData.name;
    }
    this.users.set(existing.id, existing);
    return existing;
  }

  async getAccountsForUser(userId: string): Promise<ConnectedAccount[]> {
    const result: ConnectedAccount[] = [];
    for (const acc of this.accounts.values()) {
      if (acc.userId === userId && acc.status !== 'disconnected') {
        result.push({ ...acc });
      }
    }
    return result;
  }

  async getAccountById(id: string, userId: string): Promise<ConnectedAccount | null> {
    const acc = this.accounts.get(id);
    if (acc && acc.userId === userId && acc.status !== 'disconnected') {
      return { ...acc };
    }
    return null;
  }

  async saveAccount(accountData: {
    id: string;
    userId: string;
    email: string;
    label: string;
    googleSub: string;
    hasSendPermission: boolean;
    isSelectedForDigest: boolean;
    status: 'connected' | 'needs_reauth' | 'disconnected';
    encryptedRefreshToken?: string;
  }): Promise<ConnectedAccount> {
    const account: ConnectedAccount = {
      id: accountData.id,
      userId: accountData.userId,
      email: accountData.email,
      label: accountData.label,
      googleSub: accountData.googleSub,
      hasSendPermission: accountData.hasSendPermission,
      isSelectedForDigest: accountData.isSelectedForDigest,
      status: accountData.status,
      lastSyncAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.accounts.set(account.id, account);
    if (accountData.encryptedRefreshToken) {
      this.accountTokens.set(account.id, accountData.encryptedRefreshToken);
    }
    return account;
  }

  async updateAccountLabel(id: string, userId: string, label: string, isSelected?: boolean): Promise<ConnectedAccount | null> {
    const acc = await this.getAccountById(id, userId);
    if (!acc) return null;
    acc.label = label;
    if (isSelected !== undefined) {
      acc.isSelectedForDigest = isSelected;
    }
    this.accounts.set(id, acc);
    return { ...acc };
  }

  async disconnectAccount(id: string, userId: string): Promise<boolean> {
    const acc = await this.getAccountById(id, userId);
    if (!acc) return false;
    acc.status = 'disconnected';
    acc.isSelectedForDigest = false;
    this.accounts.set(id, acc);
    this.accountTokens.delete(id);
    return true;
  }

  async getStoredRefreshToken(accountId: string): Promise<string | null> {
    return this.accountTokens.get(accountId) || null;
  }

  async saveEmailMessages(messages: EmailMessage[]): Promise<void> {
    for (const msg of messages) {
      this.messages.set(msg.id, msg);
    }
  }

  async getEmailMessages(accountId: string, limit = 50): Promise<EmailMessage[]> {
    const list: EmailMessage[] = [];
    for (const msg of this.messages.values()) {
      if (msg.accountId === accountId) {
        list.push({ ...msg });
      }
    }
    list.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    return list.slice(0, limit);
  }

  async saveDigest(digest: Digest): Promise<void> {
    this.digests.set(digest.id, { ...digest });
  }

  async getLatestDigest(userId: string): Promise<Digest | null> {
    let latest: Digest | null = null;
    for (const d of this.digests.values()) {
      if (d.userId === userId) {
        if (!latest || new Date(d.generatedAt).getTime() > new Date(latest.generatedAt).getTime()) {
          latest = d;
        }
      }
    }
    return latest ? { ...latest } : null;
  }

  async getDigestById(id: string, userId: string): Promise<Digest | null> {
    const d = this.digests.get(id);
    if (d && d.userId === userId) return { ...d };
    return null;
  }

  async getDeliveryPreference(userId: string): Promise<DeliveryPreference | null> {
    const pref = this.preferences.get(userId);
    return pref ? { ...pref } : null;
  }

  async saveDeliveryPreference(pref: DeliveryPreference): Promise<void> {
    this.preferences.set(pref.userId, { ...pref });
  }

  async createDeliveryLog(log: DeliveryLog): Promise<void> {
    this.logs.push({ ...log });
  }

  async getDueDeliveries(currentHHMM: string): Promise<{ user: User; pref: DeliveryPreference }[]> {
    const results: { user: User; pref: DeliveryPreference }[] = [];
    for (const pref of this.preferences.values()) {
      if (pref.enabled && pref.destinationAccountId && pref.deliveryTime === currentHHMM) {
        const user = this.users.get(pref.userId);
        if (user) {
          results.push({ user, pref });
        }
      }
    }
    return results;
  }
}
