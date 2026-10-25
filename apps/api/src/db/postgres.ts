import pg from 'pg';
import type {
  User,
  ConnectedAccount,
  EmailMessage,
  Digest,
  DeliveryPreference,
  DeliveryLog
} from '@gistmymail/shared';
import type { DatabaseRepository } from './interface.js';

const { Pool } = pg;

export class PostgresDatabaseRepository implements DatabaseRepository {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase')
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000
    });
  }

  async init(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          google_sub VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS connected_accounts (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          label VARCHAR(64) NOT NULL,
          google_sub VARCHAR(255) NOT NULL,
          has_send_permission BOOLEAN NOT NULL DEFAULT FALSE,
          is_selected_for_digest BOOLEAN NOT NULL DEFAULT TRUE,
          status VARCHAR(32) NOT NULL DEFAULT 'connected',
          encrypted_refresh_token TEXT,
          last_sync_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS email_messages (
          id VARCHAR(64) PRIMARY KEY,
          account_id VARCHAR(64) REFERENCES connected_accounts(id) ON DELETE CASCADE,
          account_label VARCHAR(64) NOT NULL,
          gmail_message_id VARCHAR(128) NOT NULL,
          thread_id VARCHAR(128) NOT NULL,
          sender VARCHAR(255) NOT NULL,
          sender_name VARCHAR(255) NOT NULL,
          subject TEXT NOT NULL,
          snippet TEXT NOT NULL,
          received_at TIMESTAMPTZ NOT NULL,
          cleaned_body TEXT NOT NULL,
          gmail_url TEXT NOT NULL,
          content_hash VARCHAR(64) NOT NULL,
          UNIQUE(account_id, gmail_message_id)
        );

        CREATE TABLE IF NOT EXISTS digests (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          source_accounts_count INTEGER NOT NULL,
          processed_messages_count INTEGER NOT NULL,
          items_json JSONB NOT NULL,
          summary_note TEXT,
          delivered_at TIMESTAMPTZ,
          destination_account_email VARCHAR(255),
          delivery_status VARCHAR(32) NOT NULL DEFAULT 'not_scheduled'
        );

        CREATE TABLE IF NOT EXISTS delivery_preferences (
          user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          enabled BOOLEAN NOT NULL DEFAULT TRUE,
          destination_account_id VARCHAR(64),
          destination_account_email VARCHAR(255),
          delivery_time VARCHAR(8) NOT NULL DEFAULT '08:00',
          timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
          last_attempt_at TIMESTAMPTZ,
          last_success_at TIMESTAMPTZ,
          last_error TEXT
        );

        CREATE TABLE IF NOT EXISTS delivery_logs (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          digest_id VARCHAR(64) REFERENCES digests(id) ON DELETE CASCADE,
          destination_email VARCHAR(255) NOT NULL,
          status VARCHAR(32) NOT NULL,
          attempt_count INTEGER NOT NULL DEFAULT 1,
          gmail_message_id VARCHAR(128),
          error_message TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    } finally {
      client.release();
    }
  }

  async findUserById(id: string): Promise<User | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      googleSub: r.google_sub,
      createdAt: r.created_at.toISOString()
    };
  }

  async findUserByGoogleSub(googleSub: string): Promise<User | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE google_sub = $1', [googleSub]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      googleSub: r.google_sub,
      createdAt: r.created_at.toISOString()
    };
  }

  async createOrUpdateUser(userData: { id: string; email: string; name: string; googleSub: string }): Promise<User> {
    const res = await this.pool.query(
      `INSERT INTO users (id, email, name, google_sub)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_sub) DO UPDATE
       SET email = EXCLUDED.email, name = EXCLUDED.name
       RETURNING *`,
      [userData.id, userData.email, userData.name, userData.googleSub]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      googleSub: r.google_sub,
      createdAt: r.created_at.toISOString()
    };
  }

  async getAccountsForUser(userId: string): Promise<ConnectedAccount[]> {
    const res = await this.pool.query(
      `SELECT * FROM connected_accounts WHERE user_id = $1 AND status != 'disconnected' ORDER BY created_at ASC`,
      [userId]
    );
    return res.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      email: r.email,
      label: r.label,
      googleSub: r.google_sub,
      hasSendPermission: r.has_send_permission,
      isSelectedForDigest: r.is_selected_for_digest,
      status: r.status,
      lastSyncAt: r.last_sync_at ? r.last_sync_at.toISOString() : null,
      createdAt: r.created_at.toISOString()
    }));
  }

  async getAccountById(id: string, userId: string): Promise<ConnectedAccount | null> {
    const res = await this.pool.query(
      `SELECT * FROM connected_accounts WHERE id = $1 AND user_id = $2 AND status != 'disconnected'`,
      [id, userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      email: r.email,
      label: r.label,
      googleSub: r.google_sub,
      hasSendPermission: r.has_send_permission,
      isSelectedForDigest: r.is_selected_for_digest,
      status: r.status,
      lastSyncAt: r.last_sync_at ? r.last_sync_at.toISOString() : null,
      createdAt: r.created_at.toISOString()
    };
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
    const res = await this.pool.query(
      `INSERT INTO connected_accounts 
       (id, user_id, email, label, google_sub, has_send_permission, is_selected_for_digest, status, encrypted_refresh_token, last_sync_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (id) DO UPDATE
       SET label = EXCLUDED.label,
           has_send_permission = EXCLUDED.has_send_permission,
           is_selected_for_digest = EXCLUDED.is_selected_for_digest,
           status = EXCLUDED.status,
           encrypted_refresh_token = COALESCE(EXCLUDED.encrypted_refresh_token, connected_accounts.encrypted_refresh_token),
           last_sync_at = NOW()
       RETURNING *`,
      [
        accountData.id,
        accountData.userId,
        accountData.email,
        accountData.label,
        accountData.googleSub,
        accountData.hasSendPermission,
        accountData.isSelectedForDigest,
        accountData.status,
        accountData.encryptedRefreshToken || null
      ]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      email: r.email,
      label: r.label,
      googleSub: r.google_sub,
      hasSendPermission: r.has_send_permission,
      isSelectedForDigest: r.is_selected_for_digest,
      status: r.status,
      lastSyncAt: r.last_sync_at ? r.last_sync_at.toISOString() : null,
      createdAt: r.created_at.toISOString()
    };
  }

  async updateAccountLabel(id: string, userId: string, label: string, isSelected?: boolean): Promise<ConnectedAccount | null> {
    const res = await this.pool.query(
      `UPDATE connected_accounts 
       SET label = $1, is_selected_for_digest = COALESCE($2, is_selected_for_digest)
       WHERE id = $3 AND user_id = $4 AND status != 'disconnected'
       RETURNING *`,
      [label, isSelected === undefined ? null : isSelected, id, userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      email: r.email,
      label: r.label,
      googleSub: r.google_sub,
      hasSendPermission: r.has_send_permission,
      isSelectedForDigest: r.is_selected_for_digest,
      status: r.status,
      lastSyncAt: r.last_sync_at ? r.last_sync_at.toISOString() : null,
      createdAt: r.created_at.toISOString()
    };
  }

  async disconnectAccount(id: string, userId: string): Promise<boolean> {
    const res = await this.pool.query(
      `UPDATE connected_accounts 
       SET status = 'disconnected', is_selected_for_digest = FALSE, encrypted_refresh_token = NULL 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async getStoredRefreshToken(accountId: string): Promise<string | null> {
    const res = await this.pool.query(`SELECT encrypted_refresh_token FROM connected_accounts WHERE id = $1`, [accountId]);
    if (res.rows.length === 0) return null;
    return res.rows[0].encrypted_refresh_token || null;
  }

  async saveEmailMessages(messages: EmailMessage[]): Promise<void> {
    for (const m of messages) {
      await this.pool.query(
        `INSERT INTO email_messages 
         (id, account_id, account_label, gmail_message_id, thread_id, sender, sender_name, subject, snippet, received_at, cleaned_body, gmail_url, content_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (account_id, gmail_message_id) DO NOTHING`,
        [
          m.id,
          m.accountId,
          m.accountLabel,
          m.gmailMessageId,
          m.threadId,
          m.sender,
          m.senderName,
          m.subject,
          m.snippet,
          new Date(m.receivedAt),
          m.cleanedBody,
          m.gmailUrl,
          m.contentHash
        ]
      );
    }
  }

  async getEmailMessages(accountId: string, limit = 50): Promise<EmailMessage[]> {
    const res = await this.pool.query(
      `SELECT * FROM email_messages WHERE account_id = $1 ORDER BY received_at DESC LIMIT $2`,
      [accountId, limit]
    );
    return res.rows.map(r => ({
      id: r.id,
      accountId: r.account_id,
      accountLabel: r.account_label,
      gmailMessageId: r.gmail_message_id,
      threadId: r.thread_id,
      sender: r.sender,
      senderName: r.sender_name,
      subject: r.subject,
      snippet: r.snippet,
      receivedAt: r.received_at.toISOString(),
      cleanedBody: r.cleaned_body,
      gmailUrl: r.gmail_url,
      contentHash: r.content_hash
    }));
  }

  async saveDigest(digest: Digest): Promise<void> {
    await this.pool.query(
      `INSERT INTO digests 
       (id, user_id, generated_at, source_accounts_count, processed_messages_count, items_json, summary_note, delivered_at, destination_account_email, delivery_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE
       SET delivered_at = EXCLUDED.delivered_at,
           delivery_status = EXCLUDED.delivery_status`,
      [
        digest.id,
        digest.userId,
        new Date(digest.generatedAt),
        digest.sourceAccountsCount,
        digest.processedMessagesCount,
        JSON.stringify(digest.items),
        digest.summaryNote,
        digest.deliveredAt ? new Date(digest.deliveredAt) : null,
        digest.destinationAccountEmail,
        digest.deliveryStatus
      ]
    );
  }

  async getLatestDigest(userId: string): Promise<Digest | null> {
    const res = await this.pool.query(
      `SELECT * FROM digests WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1`,
      [userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      generatedAt: r.generated_at.toISOString(),
      sourceAccountsCount: r.source_accounts_count,
      processedMessagesCount: r.processed_messages_count,
      items: typeof r.items_json === 'string' ? JSON.parse(r.items_json) : r.items_json,
      summaryNote: r.summary_note,
      deliveredAt: r.delivered_at ? r.delivered_at.toISOString() : null,
      destinationAccountEmail: r.destination_account_email,
      deliveryStatus: r.delivery_status
    };
  }

  async getDigestById(id: string, userId: string): Promise<Digest | null> {
    const res = await this.pool.query(
      `SELECT * FROM digests WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      generatedAt: r.generated_at.toISOString(),
      sourceAccountsCount: r.source_accounts_count,
      processedMessagesCount: r.processed_messages_count,
      items: typeof r.items_json === 'string' ? JSON.parse(r.items_json) : r.items_json,
      summaryNote: r.summary_note,
      deliveredAt: r.delivered_at ? r.delivered_at.toISOString() : null,
      destinationAccountEmail: r.destination_account_email,
      deliveryStatus: r.delivery_status
    };
  }

  async getDeliveryPreference(userId: string): Promise<DeliveryPreference | null> {
    const res = await this.pool.query(`SELECT * FROM delivery_preferences WHERE user_id = $1`, [userId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      userId: r.user_id,
      enabled: r.enabled,
      destinationAccountId: r.destination_account_id,
      destinationAccountEmail: r.destination_account_email,
      deliveryTime: r.delivery_time,
      timezone: r.timezone,
      lastAttemptAt: r.last_attempt_at ? r.last_attempt_at.toISOString() : null,
      lastSuccessAt: r.last_success_at ? r.last_success_at.toISOString() : null,
      lastError: r.last_error
    };
  }

  async saveDeliveryPreference(pref: DeliveryPreference): Promise<void> {
    await this.pool.query(
      `INSERT INTO delivery_preferences 
       (user_id, enabled, destination_account_id, destination_account_email, delivery_time, timezone, last_attempt_at, last_success_at, last_error)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id) DO UPDATE
       SET enabled = EXCLUDED.enabled,
           destination_account_id = EXCLUDED.destination_account_id,
           destination_account_email = EXCLUDED.destination_account_email,
           delivery_time = EXCLUDED.delivery_time,
           timezone = EXCLUDED.timezone,
           last_attempt_at = EXCLUDED.last_attempt_at,
           last_success_at = EXCLUDED.last_success_at,
           last_error = EXCLUDED.last_error`,
      [
        pref.userId,
        pref.enabled,
        pref.destinationAccountId,
        pref.destinationAccountEmail,
        pref.deliveryTime,
        pref.timezone,
        pref.lastAttemptAt ? new Date(pref.lastAttemptAt) : null,
        pref.lastSuccessAt ? new Date(pref.lastSuccessAt) : null,
        pref.lastError
      ]
    );
  }

  async createDeliveryLog(log: DeliveryLog): Promise<void> {
    await this.pool.query(
      `INSERT INTO delivery_logs 
       (id, user_id, digest_id, destination_email, status, attempt_count, gmail_message_id, error_message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        log.id,
        log.userId,
        log.digestId,
        log.destinationEmail,
        log.status,
        log.attemptCount,
        log.gmailMessageId,
        log.errorMessage,
        new Date(log.createdAt)
      ]
    );
  }

  async getDueDeliveries(currentHHMM: string): Promise<{ user: User; pref: DeliveryPreference }[]> {
    const res = await this.pool.query(
      `SELECT u.*, dp.enabled, dp.destination_account_id, dp.destination_account_email, dp.delivery_time, dp.timezone, dp.last_attempt_at, dp.last_success_at, dp.last_error
       FROM delivery_preferences dp
       JOIN users u ON u.id = dp.user_id
       WHERE dp.enabled = TRUE 
         AND dp.destination_account_id IS NOT NULL 
         AND dp.delivery_time = $1`,
      [currentHHMM]
    );
    return res.rows.map(r => ({
      user: {
        id: r.id,
        email: r.email,
        name: r.name,
        googleSub: r.google_sub,
        createdAt: r.created_at.toISOString()
      },
      pref: {
        userId: r.id,
        enabled: r.enabled,
        destinationAccountId: r.destination_account_id,
        destinationAccountEmail: r.destination_account_email,
        deliveryTime: r.delivery_time,
        timezone: r.timezone,
        lastAttemptAt: r.last_attempt_at ? r.last_attempt_at.toISOString() : null,
        lastSuccessAt: r.last_success_at ? r.last_success_at.toISOString() : null,
        lastError: r.last_error
      }
    }));
  }
}
