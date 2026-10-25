# 🔑 GistMyMail — Complete Google Cloud OAuth 2.0 & Gmail API Guide

This guide walks you through configuring **Google Cloud OAuth 2.0** and the **Gmail API** to connect real Gmail inboxes to GistMyMail.

Follow each step carefully. Even if you have never used the Google Cloud Console before, this tutorial will guide you click-by-click.

---

## 🎯 What You Will Accomplish
By the end of this tutorial, you will:
1. Create a Google Cloud Project with the Gmail API enabled.
2. Configure the OAuth Consent Screen with strictly scoped, least-privilege permissions.
3. Authorize Test Users so you can authenticate your personal or team Gmail accounts.
4. Create OAuth 2.0 Web Client credentials with matching development origins and callback URLs.
5. Connect your credentials into GistMyMail to read emails and send daily digests.

---

## 🔐 Permission Scopes Principle (Least Privilege)

GistMyMail requires access to read emails and dispatch digests. To ensure user privacy and security, GistMyMail **strictly avoids** requesting full mailbox control (`https://mail.google.com/`).

Instead, the codebase requests only the minimum necessary scopes:

| Scope | Purpose | Where Used |
|---|---|---|
| `openid` | OpenID Connect user authentication | Login identity |
| `email` | Retrieve user's email address | Account mapping |
| `profile` | Retrieve user's name & avatar | Header identity |
| `https://www.googleapis.com/auth/gmail.readonly` | Read email messages, threads, and metadata | Multi-inbox digestion |
| `https://www.googleapis.com/auth/gmail.send` | Send scheduled briefing emails on user's behalf | Digest email delivery |

*Official Reference: [Google Identity — Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes#gmail)*

---

## 📋 Step-by-Step Setup Tutorial

### Step 1: Create a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. Click the **Project Selector** dropdown in the top navigation bar (next to the "Google Cloud" logo).
4. Click **"New Project"** in the top-right corner of the modal.
5. In the **Project Name** field, enter: `GistMyMail-Dev`.
6. Leave **Organization** as "No organization" (unless using Google Workspace).
7. Click **"Create"** and wait a few seconds until the project is created.
8. Ensure your new project is selected in the top bar.

---

### Step 2: Enable the Gmail API

1. In the Google Cloud Console, open the left navigation menu (hamburger icon ☰).
2. Go to **APIs & Services** > **Library**.
3. In the search box, type `Gmail API` and press Enter.
4. Click on the **Gmail API** card published by Google.
5. Click the blue **"Enable"** button.
6. Wait for Google to redirect you to the Gmail API dashboard.

*Official Reference: [Enabling an API in Google Cloud](https://cloud.google.com/endpoints/docs/openapi/enable-api)*

---

### Step 3: Configure the OAuth Consent Screen

1. In the left sidebar under **APIs & Services**, click **OAuth consent screen** (or **Branding & Audience** in the new Google Cloud interface).
2. Under **User Type**, select **External**:
   - **Internal:** Available only if you have a Google Workspace organization and only want users inside your domain to log in.
   - **External:** Required if you plan to connect standard `@gmail.com` accounts or multiple different domains.
3. Click **"Create"**.
4. Fill in the **App information**:
   - **App name:** `GistMyMail`
   - **User support email:** Select your Gmail address from the dropdown.
   - **App logo:** (Optional, leave blank for local development).
   - **Application home page:** `http://localhost:5173`
   - **Developer contact information:** Enter your email address.
5. Click **"Save and Continue"**.

---

### Step 4: Configure Data Access & Exact Scopes

1. On the **Scopes** page, click **"Add or Remove Scopes"**.
2. A slide-out panel will appear listing available scopes.
3. Select the checkboxes for the following basic scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
4. Under the **Manually add scopes** text box at the bottom, paste the following two Gmail scopes (one per line or comma-separated):
   ```text
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/gmail.send
   ```
5. Click **"Add to Table"**, then click **"Update"**.
6. Verify that `gmail.readonly` and `gmail.send` now appear in the list under **Sensitive scopes** or **Restricted scopes**.
7. Click **"Save and Continue"**.

---

### Step 5: Add Test Users (CRITICAL)

> [!IMPORTANT]
> While your Google Cloud project is in **"Testing"** publishing status, Google's OAuth servers will **block** any Google account that is not explicitly registered as a Test User with error `403: access_denied`.

1. On the **Test users** page, click **"+ Add Users"**.
2. Enter the Gmail address of every account you plan to test with GistMyMail:
   - Your primary Google account.
   - Any secondary test inboxes you want to connect (e.g., student email, consulting email).
3. Click **"Add"**.
4. Click **"Save and Continue"**.
5. Review your Summary and click **"Back to Dashboard"**.

*Official Reference: [Google OAuth Consent Screen Testing](https://developers.google.com/workspace/guides/configure-oauth-consent#test-users)*

---

### Step 6: Create OAuth 2.0 Web Client Credentials

1. In the left sidebar, click **Credentials**.
2. Click **"+ Create Credentials"** at the top, then choose **OAuth client ID**.
3. Under **Application type**, select **Web application**.
4. In the **Name** field, enter: `GistMyMail Web Client`.
5. Under **Authorized JavaScript origins**, click **"+ Add URI"** and add:
   - `http://localhost:5173` (Frontend dev server)
   - `http://localhost:3000` (Backend API)
6. Under **Authorized redirect URIs**, click **"+ Add URI"** and enter the EXACT callback URL:
   ```text
   http://localhost:3000/auth/google/callback
   ```
   > [!WARNING]
   > Do NOT add a trailing slash (`/`). The URL must match the exact string registered in the backend code: `http://localhost:3000/auth/google/callback`.
7. Click **"Create"**.
8. A modal titled **OAuth client created** will display:
   - **Your Client ID** (e.g., `672399587244-xxxx.apps.googleusercontent.com`)
   - **Your Client Secret** (e.g., `GOCSPX-xxxx`)
9. Copy both values immediately or download the JSON file.

---

### Step 7: Configure Environment Variables in GistMyMail

Open your `.env` file in the project root and add your newly generated credentials:

```dotenv
# Google Cloud OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=672399587244-your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

---

### Step 8: Restart Backend & Test the Connection

1. Restart your backend server (`pnpm dev:api`).
2. Open [`http://localhost:5173`](http://localhost:5173) in your browser.
3. Click the primary **"Connect Gmail"** button in the header.
4. Your browser will redirect to Google's sign-in screen:
   - Select your test user account.
   - Google may show an alert: *"Google hasn't verified this app"*. Click **Advanced** > **Go to GistMyMail (unsafe)**. This is normal and expected for apps in testing mode.
   - Review permissions: Check the box allowing GistMyMail to read your email messages and send email.
   - Click **Continue**.
5. Google will redirect back to `http://localhost:3000/auth/google/callback?code=...`
6. The backend exchanges the code, securely encrypts the refresh token using AES-256-GCM, creates your user session, and redirects to `http://localhost:5173?connected=true`.
7. You should see your email address displayed in the header with full status.

---

## 🛠️ OAuth Troubleshooting Checklist

| Error / Symptom | Root Cause | Exact Solution |
|---|---|---|
| **`403 access_denied: GistMyMail has not completed the Google verification process`** | The signing-in email is not listed in Test Users. | Go to Google Cloud Console > **APIs & Services** > **OAuth consent screen** > **Test Users**, click **Add Users**, and enter your email address. |
| **`400: redirect_uri_mismatch`** | The redirect URI sent by the app doesn't match Google Cloud Console. | Ensure `GOOGLE_REDIRECT_URI` in `.env` matches the console **Authorized redirect URIs** exactly: `http://localhost:3000/auth/google/callback` (no trailing slash, HTTP not HTTPS). |
| **`401: invalid_client`** | Incorrect Client ID or Client Secret. | Copy the Client ID and Secret again from Google Cloud Console > **Credentials**. Ensure no extra spaces were pasted. |
| **`Missing Refresh Token on Re-login`** | Google only returns a refresh token on the first consent approval. | GistMyMail's `apps/api/src/auth/oauth.ts` explicitly includes `prompt: 'consent'` and `access_type: 'offline'`, forcing Google to always return a refresh token. |
| **`State mismatch / CSRF Error`** | The browser session cookie expired or was blocked. | Ensure third-party cookies or strict cookie blockers are not stripping the `oauth_state` cookie. Restart the OAuth flow from the primary "Connect Gmail" button. |

---

## 🚀 Moving to Production & Google Verification

When you deploy GistMyMail to a public domain:

1. **Update Redirect URIs:** Add your production domain in Google Cloud Console:
   - Authorized Origins: `https://yourdomain.com`
   - Authorized Redirect URIs: `https://yourdomain.com/auth/google/callback`
2. **HTTPS Requirement:** Google strictly requires `https://` for all production redirect URIs (plain `http://` is allowed only for `localhost`).
3. **Publishing Status (Verification):**
   - In "Testing" mode, you can have up to 100 registered Test Users without Google review.
   - For general public access where any stranger can log in without being added as a test user, you must submit your app for [Google OAuth App Verification](https://support.google.com/cloud/answer/9110914) demonstrating why `gmail.readonly` and `gmail.send` are required.
   - Prepare a public Privacy Policy URL and a demo video showing your app accessing and summarizing emails.
