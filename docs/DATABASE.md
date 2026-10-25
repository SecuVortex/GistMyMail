# 🗄️ GistMyMail — PostgreSQL Database Setup Guide

GistMyMail supports persistent storage using **PostgreSQL** (version 14 or higher) while featuring an automatic, resilient **In-Memory Store Fallback** for zero-dependency development.

This guide explains how to connect hosted databases (such as **Neon** or **Supabase**) or a local PostgreSQL instance, verify the connection, and manage your data safely.

---

## ⚡ Quick Architecture Overview

GistMyMail implements a decoupled repository pattern (`DatabaseRepository` interface in [`apps/api/src/db/interface.ts`](file:///apps/api/src/db/interface.ts)):

```mermaid
graph TD
    CFG["Configuration\n(config.DATABASE_URL)"] --> DECIDE{"Is DATABASE_URL\nprovided?"}
    DECIDE -- No --> MEM["MemoryDatabaseRepository\n(In-Memory HashMaps)\nZero external dependencies"]
    DECIDE -- Yes --> PG["PostgresDatabaseRepository\n(node-postgres connection pool)"]
    PG -. Connection Error .-> MEM
```

### 1. In-Memory Mode (Default)
When `DATABASE_URL` is empty in `.env`, GistMyMail boots instantly using internal TypeScript `Map` structures. This allows anyone to run the full application, run tests, and demo features with zero installation overhead.

### 2. PostgreSQL Mode (Production & Persistent Development)
When a valid `DATABASE_URL` is provided, GistMyMail connects via `pg.Pool`, enabling multi-session persistence, durable token storage, and scheduled delivery tracking.

---

## ☁️ Hosted PostgreSQL Options (Free & Recommended)

### Option A: Neon Serverless Postgres (Recommended)

[Neon](https://neon.tech) offers serverless PostgreSQL with generous free tiers, branching, and automated SSL.

1. Go to [neon.tech](https://neon.tech) and sign up with GitHub or Google.
2. In the Neon Console, click **"Create Project"**.
3. Name your project `gistmymail-db` and select the region nearest to you.
4. On the Project Dashboard, find the **Connection Details** box.
5. Ensure the dropdown is set to **"Pooled connection"** and language is set to **Node.js** or **Direct**.
6. Copy the connection string. It will look like:
   ```text
   postgres://username:password@ep-cool-fog-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
7. Open `.env` in your GistMyMail project root and paste the URL:
   ```dotenv
   DATABASE_URL=postgres://username:password@ep-cool-fog-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

### Option B: Supabase Database

[Supabase](https://supabase.com) provides hosted PostgreSQL with built-in connection poolers.

1. Sign in to [supabase.com](https://supabase.com) and create a **New Project**.
2. Set a secure database password (save this password).
3. Once the database is provisioned, go to **Project Settings** (gear icon) > **Database**.
4. Scroll down to the **Connection string** section.
5. Select the **URI** tab. Check the box for **"Use connection pooling"** (Mode: Session, Port: 5432 or 6543).
6. Copy the URI string, replacing `[YOUR-PASSWORD]` with your actual database password:
   ```text
   postgresql://postgres.yourprojectref:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
7. Paste this into your `.env` file under `DATABASE_URL`.

---

## 💻 Local PostgreSQL Setup

If you prefer running PostgreSQL locally on your machine:

### Using Docker:
```bash
docker run --name gistmymail-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gistmymail -p 5432:5432 -d postgres:16-alpine
```

Your connection string will be:
```dotenv
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gistmymail
```

### Using Native Windows / macOS Installer:
1. Install PostgreSQL via the official installer or Homebrew (`brew install postgresql`).
2. Open `psql` or pgAdmin and create a database:
   ```sql
   CREATE DATABASE gistmymail;
   ```
3. Set your connection string in `.env`:
   ```dotenv
   DATABASE_URL=postgres://postgres:your_local_password@localhost:5432/gistmymail
   ```

---

## 📜 Schema & Automatic Table Initialization

GistMyMail manages database schema creation **automatically and idempotently** during startup. You do **not** need to run manual migration scripts or install external migration CLIs.

When the backend connects to PostgreSQL, `PostgresDatabaseRepository.init()` automatically runs `CREATE TABLE IF NOT EXISTS` for all six core tables:

| Table Name | Description | Key Columns |
|---|---|---|
| **`users`** | Core user identities | `id`, `email`, `name`, `google_sub`, `created_at` |
| **`connected_accounts`** | Connected Gmail accounts | `id`, `user_id`, `email`, `label`, `has_send_permission`, `encrypted_refresh_token` |
| **`email_messages`** | Synchronized email bodies & metadata | `id`, `account_id`, `gmail_message_id`, `sender`, `subject`, `cleaned_body`, `content_hash` |
| **`digests`** | Historical generated digests | `id`, `user_id`, `generated_at`, `items_json`, `delivery_status` |
| **`delivery_preferences`** | Automated delivery schedule | `user_id`, `enabled`, `destination_account_id`, `delivery_time`, `timezone` |
| **`delivery_logs`** | Dispatch audit logs | `id`, `user_id`, `digest_id`, `destination_email`, `status`, `gmail_message_id` |

*Official Reference: Review the full DDL in [`apps/api/src/db/postgres.ts`](file:///apps/api/src/db/postgres.ts#L31-L125).*

---

## 🔍 How to Verify Active PostgreSQL Connection

To verify that GistMyMail is using real PostgreSQL rather than falling back to in-memory storage, inspect your backend startup terminal output:

### Successful PostgreSQL Connection:
```text
Connecting to PostgreSQL database...
PostgreSQL database connected and initialized.
[Scheduler] Background delivery scheduler started (checking every minute)...
🚀 GistMyMail API server listening on http://localhost:3000
```

### In-Memory Fallback:
If `DATABASE_URL` is empty, or if connection credentials fail:
```text
Initializing in-memory database store (zero external dependencies)...
```
Or:
```text
Failed to connect to PostgreSQL. Falling back to in-memory store: password authentication failed for user "postgres"
```

You can also check the health endpoint at [`http://localhost:3000/health`](http://localhost:3000/health):
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 🛠️ Database Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| **`self-signed certificate in certificate chain`** | Hosted database requires SSL certificate validation. | GistMyMail automatically detects `neon.tech`, `supabase`, or `sslmode=require` and applies `{ rejectUnauthorized: false }`. Ensure your URL includes `?sslmode=require`. |
| **`password authentication failed`** | Incorrect database password or special characters in password. | If your password contains special characters (e.g., `#`, `@`, `!`), URL-encode them (e.g., `#` becomes `%23`). |
| **`Connection terminated unexpectedly`** | Serverless database slept or idle connection closed. | GistMyMail configures `idleTimeoutMillis: 30000` and `max: 10` on the connection pool. Subsequent requests will automatically acquire a fresh connection. |
| **`getaddrinfo ENOTFOUND`** | Database host domain cannot be resolved. | Check your internet connection and verify the database host hostname in the connection URL. |

---

## 🔒 Security Best Practices

1. **Protect Credentials:** Never commit your `DATABASE_URL` with database passwords to GitHub. Always use `.env`.
2. **SSL Encryption:** Always enforce SSL in production using `?sslmode=require` on the connection string.
3. **Data Backups:** For production instances on Neon or Supabase, enable automated daily point-in-time recovery (PITR).
