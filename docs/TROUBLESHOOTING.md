# 🛠️ GistMyMail — Comprehensive Troubleshooting FAQ

This guide indexes common issues, error messages, root causes, and verified fixes across all GistMyMail subsystems.

---

## 📑 Diagnostic Index
- [1. Port & Startup Conflicts](#1-port--startup-conflicts)
- [2. Google OAuth & Authentication Errors](#2-google-oauth--authentication-errors)
- [3. Database & Storage Issues](#3-database--storage-issues)
- [4. AI Provider & Inference Errors](#4-ai-provider--inference-errors)
- [5. Email Delivery & Scheduler Failures](#5-email-delivery--scheduler-failures)
- [6. Frontend & Vite Proxy Problems](#6-frontend--vite-proxy-problems)

---

## 1. Port & Startup Conflicts

### `Error: listen EADDRINUSE: address already in use :::3000` (or `5173`)
**Cause:** Another process (an earlier server run, another dev server, or a background service) is already listening on port 3000 or 5173.

**Solution on Windows PowerShell:**
```powershell
# 1. Identify the blocking process ID (PID)
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess, State

# 2. Terminate the process (replace <PID> with the actual number)
Stop-Process -Id <PID> -Force

# One-liner to kill whatever is using port 3000:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

**Solution on macOS / Linux:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

---

## 2. Google OAuth & Authentication Errors

### `403 access_denied: GistMyMail has not completed the Google verification process`
- **Cause:** Your Google Cloud project is in **"Testing"** publishing status, and the Google account you are attempting to log in with has not been added to the **Test Users** whitelist.
- **Solution:**
  1. Open [Google Cloud Console](https://console.cloud.google.com).
  2. Navigate to **APIs & Services** > **OAuth consent screen** (or **Audience**).
  3. Under **Test Users**, click **"+ Add Users"**.
  4. Enter your exact `@gmail.com` address and click **Save**.
  5. Wait 30 seconds and try logging in again.

---

### `Error 400: redirect_uri_mismatch`
- **Cause:** The redirect URI sent by the backend does not match any URI registered under **Authorized redirect URIs** in Google Cloud Console character-for-character.
- **Checklist:**
  - Registered URI in Google Cloud Console must be:
    `http://localhost:3000/auth/google/callback`
  - Ensure there is **NO trailing slash** at the end.
  - Ensure the protocol is `http://` for localhost, not `https://`.
  - Ensure `GOOGLE_REDIRECT_URI` in `.env` matches this exact string.

---

### `401: invalid_client (The OAuth client was not found)`
- **Cause:** Missing, truncated, or incorrect `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`.
- **Solution:** Re-copy the credentials directly from Google Cloud Console > **Credentials** > **OAuth 2.0 Client IDs**. Ensure no leading or trailing whitespace was copied.

---

### Google OAuth Doesn't Return a Refresh Token on Subsequent Logins
- **Cause:** By default, Google only issues a `refresh_token` the very first time a user approves an app's consent screen. Subsequent logins only return a short-lived `access_token`.
- **Solution:** GistMyMail's [`apps/api/src/auth/oauth.ts`](file:///apps/api/src/auth/oauth.ts) explicitly configures:
  ```typescript
  access_type: 'offline',
  prompt: 'consent'
  ```
  This forces Google to reissue a refresh token on every connection. If you still encounter missing refresh tokens, visit [myaccount.google.com/permissions](https://myaccount.google.com/permissions), revoke access to "GistMyMail", and reconnect.

---

## 3. Database & Storage Issues

### `Error: self-signed certificate in certificate chain` (Neon / Supabase)
- **Cause:** Hosted PostgreSQL requires SSL encryption, but Node.js rejected the intermediate certificate.
- **Solution:** GistMyMail automatically detects hosted providers and sets `{ rejectUnauthorized: false }`. Ensure your `DATABASE_URL` ends with:
  `?sslmode=require`

---

### `password authentication failed for user "postgres"`
- **Cause:** Wrong password in `DATABASE_URL`.
- **Solution:** Check your database credentials. If your password contains special symbols (like `@`, `#`, `?`, or `%`), you must URL-encode them (e.g., `#` becomes `%23`, `@` becomes `%40`).

---

### Server Boots in In-Memory Store Mode Unintentionally
- **Check:** Look at the backend startup logs:
  ```text
  Initializing in-memory database store (zero external dependencies)...
  ```
- **Solution:** Check if `DATABASE_URL` in `.env` is empty or commented out. If provided, check if a connection error message was printed immediately preceding the fallback log.

---

## 4. AI Provider & Inference Errors

### `OpenRouter API request failed with HTTP 401: Unauthorized`
- **Cause:** Missing or invalid `OPENROUTER_API_KEY`.
- **Solution:** Check `.env`. Ensure `OPENROUTER_API_KEY` starts with `sk-or-v1-` and verify that the key has not been deleted or rate-limited at [openrouter.ai/keys](https://openrouter.ai/keys).

---

### `OpenRouter API request failed with HTTP 429: Too Many Requests`
- **Cause:** High traffic on the selected free model.
- **Solution:**
  1. GistMyMail automatically attempts a fallback to `nvidia/nemotron-3.5-lightning:free`.
  2. If all free models are congested, temporarily switch to `AI_PROVIDER=mock` for testing or `AI_PROVIDER=ollama` for private local inference.

---

### `Ollama request failed with fetch failed (ECONNREFUSED 127.0.0.1:11434)`
- **Cause:** The Ollama local daemon is not running on port 11434.
- **Solution:**
  1. Open the Ollama desktop app or run `ollama serve` in a terminal.
  2. Verify it is running by visiting `http://localhost:11434` in your browser (should return *"Ollama is running"*).
  3. Ensure the model is downloaded (`ollama pull llama3.2:3b`).

---

## 5. Email Delivery & Scheduler Failures

### `Failed to send email via Gmail API: Insufficient Permission`
- **Cause:** The destination inbox was connected with read-only permissions (`gmail.readonly`) without the send scope (`gmail.send`).
- **Solution:**
  1. In the web dashboard, look at the **Connected Inboxes** list.
  2. If the destination account shows `Read-Only`, click **"Connect Real Gmail Account"**.
  3. On Google's consent screen, ensure you check the box granting GistMyMail permission to **"Send email on your behalf"**.

---

### Scheduled Delivery Did Not Fire at the Configured Time
- **Checklist:**
  1. Is the Fastify backend running? (The scheduler is an in-process daemon).
  2. Is `SCHEDULER_ENABLED=true` in `.env`?
  3. Does `DEFAULT_TIMEZONE` match your actual timezone?
  4. Check the **Delivery Preferences** panel: Is the **"Scheduled Dispatch"** toggle enabled?
  5. Check `delivery_logs` in the database to see if a send attempt failed with an API error.

---

## 6. Frontend & Vite Proxy Problems

### Frontend Displays `Failed to fetch` or `502 Bad Gateway` on API Calls
- **Cause:** The Vite dev server (`http://localhost:5173`) proxies `/api` and `/auth` calls to `http://localhost:3000`. If the Fastify API backend has crashed or is not running, the proxy returns `502`.
- **Solution:** Start the backend server in a separate terminal:
  ```powershell
  pnpm dev:api
  ```
  Ensure it prints `GistMyMail API server listening on http://localhost:3000`.

---

### Session Clears When Refreshing the Page
- **Cause:** Third-party cookie blocking in browser or missing credentials in fetch requests.
- **Solution:** GistMyMail enforces `credentials: 'include'` on all client requests and sets `SameSite=Lax` on session cookies. Ensure your browser is not blocking first-party cookies on `localhost`.
