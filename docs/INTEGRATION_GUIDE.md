# GistMyMail Integration & Setup Guide

> Step-by-step setup instructions for Google Cloud OAuth, AI providers (Local Ollama / OpenRouter), and Database configurations.

---

## 1. Google Cloud OAuth 2.0 Setup

To connect live Gmail accounts, configure Google Cloud credentials:

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **New Project**.
3. Name your project (e.g., `GistMyMail-Dev`) and click **Create**.

### Step 2: Enable the Gmail API
1. In the sidebar, navigate to **APIs & Services** > **Library**.
2. Search for **Gmail API**.
3. Select **Gmail API** and click **Enable**.

### Step 3: Configure the OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Enter the required app details:
   - **App name:** `GistMyMail`
   - **User support email:** Your email address
   - **Developer contact information:** Your email address
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and add:
   - `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
6. Click **Save and Continue**.
7. Under **Test users**, add your own Gmail addresses that you will test with.

### Step 4: Create OAuth 2.0 Client Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Choose **Web application** as the application type.
4. Set the following exact values:
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
   - **Authorized redirect URIs:**
     - `http://localhost:3000/auth/google/callback`
5. Click **Create**.
6. Copy the **Client ID** and **Client Secret** into your `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ```

---

## 2. AI Provider Configuration

GistMyMail supports three interchangeable AI inference modes:

### Mode A: OpenRouter AI Gateway (Cloud / Free Tier)
Ideal for testing high-capacity models without requiring a local GPU.
```env
AI_PROVIDER=openrouter
AI_MODEL=google/gemma-4-31b-it:free
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```
> [!TIP]
> GistMyMail automatically configures fallback routing to `nvidia/nemotron-3.5-lightning:free` if Google AI Studio free pools encounter rate-limit spikes (`429`).

### Mode B: Ollama (100% Private Local Inference)
Runs entirely on your machine with zero external network dependencies.
1. Install [Ollama](https://ollama.com).
2. Pull and start your chosen model:
   ```bash
   ollama run llama3.2:3b
   # or for lower RAM usage:
   ollama run qwen3:1.7b
   ```
3. Update `.env`:
   ```env
   AI_PROVIDER=ollama
   AI_MODEL=llama3.2:3b
   OLLAMA_BASE_URL=http://localhost:11434
   ```

### Mode C: Deterministic Mock Provider (Zero Setup / Fast Tests)
Default offline mode providing deterministic test scenarios without requiring an API key or Ollama.
```env
AI_PROVIDER=mock
```

---

## 3. Database Configuration

### Option 1: In-Memory Mode (Default / Zero Dependencies)
If `DATABASE_URL` is left empty in `.env`:
```env
DATABASE_URL=
```
GistMyMail runs using `MemoryDatabaseRepository`. All user accounts, preferences, messages, and digests are stored in memory. Perfect for rapid development and hackathon evaluations.

### Option 2: PostgreSQL (Neon / Supabase / Local)
To persist data across server restarts, provide a standard PostgreSQL connection URI:
```env
DATABASE_URL=postgres://user:password@ep-sample-123.ap-southeast-1.aws.neon.tech/gistmymail?sslmode=require
```
On startup, GistMyMail automatically verifies connectivity and runs idempotent DDL migrations creating `users`, `connected_accounts`, `email_messages`, `digests`, `delivery_preferences`, and `delivery_logs`.

---

## 4. Environment Variables Dictionary

| Variable | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`). |
| `PORT` | No | `3000` | Port for the Fastify API backend. |
| `APP_BASE_URL` | No | `http://localhost:5173` | Frontend origin for CORS and OAuth redirects. |
| `API_BASE_URL` | No | `http://localhost:3000` | Backend API base URL. |
| `SESSION_SECRET` | Yes (in prod) | *Built-in dev secret* | 32-byte string used for cookie session encryption. |
| `TOKEN_ENCRYPTION_KEY` | Yes (in prod) | *Built-in dev key* | 32-byte hex/base64 key for AES-256-GCM token encryption. |
| `DATABASE_URL` | No | `""` (In-memory) | PostgreSQL connection string. |
| `GOOGLE_CLIENT_ID` | Conditional | `""` | Google Cloud OAuth 2.0 Web Client ID. |
| `GOOGLE_CLIENT_SECRET` | Conditional | `""` | Google Cloud OAuth 2.0 Client Secret. |
| `GOOGLE_REDIRECT_URI` | No | `http://localhost:3000/auth/google/callback` | OAuth callback endpoint. |
| `AI_PROVIDER` | No | `mock` | Active AI provider (`mock`, `openrouter`, `ollama`). |
| `AI_MODEL` | No | `llama3.2:3b` | Model identifier passed to Ollama or OpenRouter. |
| `OPENROUTER_API_KEY` | Conditional | `""` | OpenRouter bearer API key. |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Endpoint for local Ollama daemon. |
| `SCHEDULER_ENABLED` | No | `true` | Enables background cron delivery loop. |
| `DEFAULT_TIMEZONE` | No | `Asia/Kolkata` | Default user timezone for schedule evaluation. |
| `DEFAULT_DELIVERY_TIME`| No | `08:00` | Default daily dispatch time in 24-hr `HH:mm` format. |
