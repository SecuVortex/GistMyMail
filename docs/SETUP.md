# 🚀 GistMyMail — Complete Local Setup & Development Guide

Welcome to the GistMyMail setup guide. This document provides step-by-step instructions for developers of all experience levels to clone, configure, run, test, and troubleshoot GistMyMail locally on their machine.

Instructions prioritize **Windows PowerShell**, with cross-platform alternatives provided for **macOS and Linux (Bash/Zsh)**.

---

## 📋 System Prerequisites

Ensure you have the following installed on your development machine before proceeding:

| Requirement | Minimum Version | Recommended | How to Verify |
|---|---|---|---|
| **Node.js** | `v20.0.0` | `v22.x LTS` | `node -v` |
| **pnpm** | `v9.0.0` | `v10.x` or `v11.x` | `pnpm -v` |
| **Git** | `v2.30+` | Latest | `git --version` |
| **Web Browser** | Any modern browser | Chrome, Edge, Firefox, Brave | — |

> [!TIP]
> If you do not have `pnpm` installed, install it globally using Node's corepack:
> ```powershell
> corepack enable
> corepack prepare pnpm@latest --activate
> ```
> Or via npm:
> ```powershell
> npm install -g pnpm
> ```

---

## 🛠️ Step-by-Step Installation

### Step 1: Clone the Repository

Clone the project from GitHub into your local workspace:

```powershell
# Windows PowerShell
git clone https://github.com/SecuVortex/GistMyMail.git
cd GistMyMail
```

```bash
# macOS / Linux (Bash or Zsh)
git clone https://github.com/SecuVortex/GistMyMail.git
cd GistMyMail
```

---

### Step 2: Install Workspace Dependencies

GistMyMail is structured as a pnpm workspace containing three subpackages (`shared`, `api`, and `web`). Install all dependencies with a single command from the root directory:

```powershell
pnpm install
```

This installs Fastify v5, React 19, Vite v6, TypeScript 5.8, Tailwind CSS, Google APIs client, and Vitest.

---

### Step 3: Configure Environment Variables

Create your local `.env` file from the provided template:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS / Linux
cp .env.example .env
```

Open `.env` in your editor. GistMyMail is **pre-configured with safe developer defaults**:
- By default, `DATABASE_URL` is empty, which boots the application in **In-Memory Store Mode** (zero external dependencies required).
- By default, `AI_PROVIDER=mock`, which generates realistic, deterministic digest summaries instantly without requiring an API key.

To enable live Google OAuth or AI inference, refer to:
- [Google Cloud OAuth Guide](file:///docs/GOOGLE_OAUTH.md)
- [PostgreSQL Database Guide](file:///docs/DATABASE.md)
- [AI Providers & Inference Guide](file:///docs/AI_PROVIDERS.md)

---

### Step 4: Start the Development Servers

GistMyMail consists of two development processes:
1. **Backend Fastify API** listening on `http://localhost:3000`
2. **Frontend React + Vite UI** listening on `http://localhost:5173`

We recommend running them in two separate terminal windows so you can inspect server logs and client messages simultaneously.

#### Option A: Two Separate Terminals (Recommended)

**Terminal 1 — Backend API:**
```powershell
pnpm dev:api
```

You should see log output similar to:
```text
[dotenv@17.2.3] injecting env var: NODE_ENV, PORT, APP_BASE_URL...
Initializing in-memory database store (zero external dependencies)...
[Scheduler] Background delivery scheduler started (checking every minute)...
🚀 GistMyMail API server listening on http://localhost:3000
```

**Terminal 2 — Frontend Web:**
```powershell
pnpm dev:web
```

You should see log output similar to:
```text
  VITE v6.4.5  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
  ➜  press h + enter to show help
```

#### Option B: Combined Concurrently (Single Terminal)

```powershell
pnpm dev
```
*Note: This starts both processes concurrently in your active terminal.*

---

### Step 5: Verify Application Health

Open your browser and verify the endpoints:

1. **Backend Health Check:** Visit [`http://localhost:3000/health`](http://localhost:3000/health). You should receive:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-10-25T09:41:00.000Z",
     "database": "connected",
     "scheduler": "active",
     "aiProvider": "mock"
   }
   ```
2. **Web Dashboard:** Visit [`http://localhost:5173`](http://localhost:5173). You should see the modern GistMyMail dashboard.

---

### Step 6: Explore Development Demo Mode

If you have not configured Google Cloud credentials yet, you can test the entire application immediately using **Development Demo Mode**:

1. Click **"Try Demo Mode"** in the top navigation bar.
2. An amber notification banner confirms demo mode is active.
3. Three simulated inboxes (`College`, `Clients`, `Business`) will populate the sidebar.
4. Click **"Generate Today's Digest"**.
5. Within 500ms, the central briefing view will display synthesized items with verified evidence quotes, deadline badges, and category filters.

---

## 🧪 Running Automated Tests & Benchmarks

GistMyMail includes automated unit and integration tests powered by Vitest.

### Run All Tests
```powershell
pnpm test
```

Expected output:
```text
 ✓ tests/evidence-aggregator.test.ts (5 tests)
 ✓ tests/oauth-and-dedup.test.ts (2 tests)
 ✓ tests/repeat-runs.test.ts (1 test)
 ✓ tests/openrouter-integration.test.ts (1 test)

Test Files  4 passed (4)
     Tests  9 passed (9)
```

### Run Hackathon 3-Repeat-Runs Benchmark Matrix
```powershell
pnpm test:runs
```

This executes 3 repeated digest generation runs over multi-inbox streams, outputting the benchmark table showing latency, items extracted, 100% quote verification rate, and tokens/sec throughput.

---

## 🏗️ Production Build Verification

Verify that all packages compile cleanly to static artifacts and executable JavaScript:

```powershell
pnpm build
```

The script builds:
1. `@gistmymail/shared` -> TypeScript declarations (`dist/`)
2. `@gistmymail/api` -> Fastify server bundle (`dist/`)
3. `@gistmymail/web` -> Vite optimized production bundle (`dist/index.html`, `dist/assets/`)

---

## 🔍 Port Troubleshooting & Process Management

If port `3000` or `5173` is already in use by a background process, the server will fail with `EADDRINUSE`.

### On Windows PowerShell:

1. Find the Process ID (PID) occupying the port:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess, LocalAddress, LocalPort, State
   ```
2. Terminate the blocking process:
   ```powershell
   Stop-Process -Id <PID> -Force
   ```
   *(Replace `<PID>` with the actual process number from step 1).*

Alternatively, one-liner to kill the process on port 3000:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### On macOS / Linux:

1. Find and kill the process occupying port 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

---

## ⏹️ Safe Shutdown & Restart Procedures

- **To Stop Servers:** Press `Ctrl + C` in the active terminal window. When prompted `Terminate batch job (Y/N)?`, type `Y` and press `Enter`.
- **To Restart Cleanly:**
  ```powershell
  # Windows PowerShell
  pnpm dev:api
  ```

---

## 📚 Supportive Guides

Now that your local environment is running, follow the guides below to connect live services:

- 🔑 **[Google OAuth & Gmail API Setup](file:///docs/GOOGLE_OAUTH.md)** — Connect real Gmail inboxes and authorize read/send permissions.
- 🗄️ **[PostgreSQL Database Guide](file:///docs/DATABASE.md)** — Connect Supabase, Neon, or local PostgreSQL.
- 🤖 **[AI Providers Guide](file:///docs/AI_PROVIDERS.md)** — Configure OpenRouter or local private Ollama.
- 📬 **[Email Delivery Guide](file:///docs/EMAIL_DELIVERY.md)** — Configure automated scheduled email dispatches.
- 🚀 **[Production Deployment Guide](file:///docs/DEPLOYMENT.md)** — Deploy GistMyMail to cloud VPS / PaaS.
- 🛠️ **[Troubleshooting FAQ](file:///docs/TROUBLESHOOTING.md)** — Quick solutions for common issues.
