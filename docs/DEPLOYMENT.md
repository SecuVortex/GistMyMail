# 🚀 GistMyMail — Production Deployment Guide

This guide covers deploying GistMyMail to production environments, including cloud platforms (Render, Railway, Fly.io), traditional Linux VPS (Ubuntu/Debian with PM2 & Nginx), and Docker containers.

---

## 🔒 Production Architecture & Requirements

Before deploying to production, review the following essential architectural constraints:

```mermaid
graph LR
    USER["User / Browser\n(HTTPS)"] --> PROXY["Reverse Proxy / SSL\n(Cloudflare / Nginx / Caddy)"]
    PROXY --> WEB["React + Vite Static Bundle\n(Nginx or Static CDN)"]
    PROXY --> API["Fastify Node.js Backend\n(Port 3000 - Long Running Process)"]
    API --> DB[("PostgreSQL Database\n(Neon / Supabase / RDS)")]
    API --> GOOG["Google Cloud OAuth & Gmail API\n(HTTPS)"]
    API --> AI["OpenRouter / Ollama AI Gateway\n(HTTPS)"]
```

### 1. Mandatory HTTPS
Google's OAuth 2.0 servers **strictly forbid** unencrypted HTTP callback URLs in production. Your production redirect URI must be `https://` (plain `http://` is only permitted for `localhost`).

### 2. Continuous Background Daemon Requirement
GistMyMail features an internal 60-second delivery scheduler (`apps/api/src/delivery/scheduler.ts`).
- **Supported Hosts:** Long-running Node.js processes (PaaS Web Services like Railway, Render, Fly.io, or VPS with systemd/PM2).
- **Serverless Limitations:** Ephemeral serverless functions (e.g., standard Vercel serverless) terminate immediately after completing a request and cannot maintain continuous background timers without an external webhook trigger.

### 3. Persistent Database
Ensure `DATABASE_URL` is configured with a persistent PostgreSQL database (such as **Neon** or **Supabase**). While in-memory mode works locally, container restarts in production would erase connected accounts and OAuth tokens.

---

## 🔐 Generating Production Cryptographic Secrets

Generate high-entropy 32-byte cryptographic keys for session cookies and AES-256 token encryption:

```bash
# Generate SESSION_SECRET (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate TOKEN_ENCRYPTION_KEY (32 bytes / 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save these outputs to your production environment variables.

---

## ☁️ Option A: Deploy to Railway / Render (Recommended PaaS)

Platforms like [Railway](https://railway.app) or [Render](https://render.com) provide simple git-based continuous deployment for long-running Node.js monorepos.

### 1. Environment Variables in Dashboard
Configure the following in your service's **Environment** tab:

```dotenv
NODE_ENV=production
PORT=3000
APP_BASE_URL=https://gistmymail.yourdomain.com
API_BASE_URL=https://gistmymail.yourdomain.com
SESSION_SECRET=<generated-32-byte-hex>
TOKEN_ENCRYPTION_KEY=<generated-64-character-hex>
DATABASE_URL=postgres://user:password@neon-or-supabase-host/neondb?sslmode=require
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://gistmymail.yourdomain.com/auth/google/callback
AI_PROVIDER=openrouter
AI_MODEL=google/gemma-4-31b-it:free
OPENROUTER_API_KEY=sk-or-v1-your-key
SCHEDULER_ENABLED=true
DEFAULT_TIMEZONE=Asia/Kolkata
DEFAULT_DELIVERY_TIME=08:00
```

### 2. Build & Start Commands
- **Build Command:**
  ```bash
  pnpm install && pnpm build
  ```
- **Start Command:**
  ```bash
  node apps/api/dist/index.js
  ```

---

## 🐧 Option B: Deploy to Linux VPS (Ubuntu / Debian)

### Step 1: Install Node.js & pnpm
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pnpm pm2
```

### Step 2: Clone and Build
```bash
git clone https://github.com/SecuVortex/GistMyMail.git /var/www/gistmymail
cd /var/www/gistmymail
pnpm install
cp .env.example .env
# Edit .env with your production values: nano .env
pnpm build
```

### Step 3: Run with PM2 Process Manager
```bash
pm2 start apps/api/dist/index.js --name "gistmymail-api"
pm2 startup
pm2 save
```

### Step 4: Configure Nginx Reverse Proxy & SSL
Create `/etc/nginx/sites-available/gistmymail`:

```nginx
server {
    listen 80;
    server_name gistmymail.yourdomain.com;

    # Serve Vite frontend static files
    location / {
        root /var/www/gistmymail/apps/web/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API and OAuth requests to Fastify backend
    location ~ ^/(api|auth|health) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and obtain a free Let's Encrypt SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/gistmymail /etc/nginx/sites-enabled/
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gistmymail.yourdomain.com
```

---

## 🐳 Option C: Docker Deployment

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:22-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps ./apps
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
```

---

## 🩺 Production Health Checks & Monitoring

Verify your production deployment using the `/health` endpoint:

```bash
curl -i https://gistmymail.yourdomain.com/health
```

Expected HTTP 200 response:
```json
{
  "status": "ok",
  "timestamp": "2026-10-25T12:00:00.000Z",
  "database": "connected",
  "scheduler": "active",
  "aiProvider": "openrouter"
}
```
