# Graph Report - .  (2026-10-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 628 nodes · 757 edges · 31 communities (27 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `957b89c3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.ts
- GistMyMail — Hackathon MVP Implementation Plan
- DatabaseRepository
- dependencies
- PRESENTATION.md
- keywords
- devDependencies
- README.md
- 📬 GistMyMail
- 🛠️ GistMyMail — Comprehensive Troubleshooting FAQ
- src/types.ts
- compilerOptions
- 🚀 GistMyMail — Complete Local Setup & Development Guide
- ai/index.ts
- MemoryDatabaseRepository
- 🤖 GistMyMail — AI Providers & Inference Configuration
- 🗄️ GistMyMail — PostgreSQL Database Setup Guide
- 🚀 GistMyMail — Production Deployment Guide
- 📬 GistMyMail — Email Digest Generation & Delivery Guide
- 📋 Step-by-Step Setup Tutorial
- 1. Google Cloud OAuth 2.0 Setup
- shared/package.json
- compilerOptions
- compilerOptions
- rules/graphify.md
- workflows/graphify.md

## God Nodes (most connected - your core abstractions)
1. `DatabaseRepository` - 25 edges
2. `PostgresDatabaseRepository` - 23 edges
3. `MemoryDatabaseRepository` - 22 edges
4. `GistMyMail — Hackathon MVP Implementation Plan` - 19 edges
5. `compilerOptions` - 16 edges
6. `getDatabase()` - 13 edges
7. `📬 GistMyMail` - 13 edges
8. `keywords` - 13 edges
9. `compilerOptions` - 11 edges
10. `config` - 11 edges

## Surprising Connections (you probably didn't know these)
- `generateUserDigest()` --calls--> `validateAndAggregateItems()`  [EXTRACTED]
  apps/api/src/digest/generator.ts → apps/api/src/ai/aggregator/deterministic.ts
- `buildApp()` --indirect_call--> `accountsRoutes()`  [INFERRED]
  apps/api/src/app.ts → apps/api/src/routes/accounts.routes.ts
- `buildApp()` --indirect_call--> `authRoutes()`  [INFERRED]
  apps/api/src/app.ts → apps/api/src/routes/auth.routes.ts
- `buildApp()` --indirect_call--> `deliveryRoutes()`  [INFERRED]
  apps/api/src/app.ts → apps/api/src/routes/delivery.routes.ts
- `buildApp()` --indirect_call--> `digestRoutes()`  [INFERRED]
  apps/api/src/app.ts → apps/api/src/routes/digest.routes.ts

## Import Cycles
- None detected.

## Communities (31 total, 4 thin omitted)

### Community 0 - "app.ts"
Cohesion: 0.10
Nodes (35): getAIProvider(), buildApp(), BASE_SCOPES, exchangeOAuthCode(), generateGoogleAuthUrl(), getAuthorizedGmailClient(), getOAuth2Client(), AppConfig (+27 more)

### Community 1 - "GistMyMail — Hackathon MVP Implementation Plan"
Cohesion: 0.04
Nodes (45): 10. AI provider configuration, 11. Background job design and Docker, 12. Google OAuth verification and realistic limitations, 13. Repeatable test plan, 14. Suggested repository structure, 15. Prioritized implementation checklist, 16. Exact acceptance criteria, 17. Features to postpone deliberately (+37 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (37): dependencies, fastify, @fastify/cookie, @fastify/cors, @gistmymail/shared, googleapis, pg, zod (+29 more)

### Community 4 - "PRESENTATION.md"
Cohesion: 0.07
Nodes (37): **Automated Test Matrix:**, **Core Data Pipeline:**, **End-to-End User Experience:**, **Get Started & Open Source Links:**, 📬 GistMyMail, 📑 GistMyMail — Hackathon Presentation Deck (6 Slides), **Hack Day Jaipur 2026 — 3 Repeat Runs Benchmark Matrix:**, **Headline:** (+29 more)

### Community 5 - "keywords"
Cohesion: 0.06
Nodes (33): description, engines, node, keywords, name, packageManager, pnpm, onlyBuiltDependencies (+25 more)

### Community 6 - "devDependencies"
Cohesion: 0.06
Nodes (34): dependencies, clsx, @gistmymail/shared, lucide-react, react, react-dom, devDependencies, tailwindcss (+26 more)

### Community 7 - "README.md"
Cohesion: 0.06
Nodes (28): 1. High-Level System Architecture, 2.1 Multi-Inbox Ingestion & Purpose Labeling, 2.2 The Deterministic Evidence Verifier (The Guardrail), 2.3 Prompt Injection Defense & Quarantine, 2.4 Resilient Dual-Mode Database Layer, 2.5 Multi-Provider AI Inference Gateway, 2. Core Subsystems, 3. Data Models & Schemas (+20 more)

### Community 8 - "📬 GistMyMail"
Cohesion: 0.08
Nodes (25): 1. Local Ollama (Recommended for Privacy), 1. Prerequisites, 2. Clone & Install, 2. OpenRouter Gateway (Cloud / Free Tier), 3. Deterministic Mock (Instant Offline Testing), 3. Environment Configuration, 4. Build Monorepo, 5. Run Automated Tests (+17 more)

### Community 9 - "🛠️ GistMyMail — Comprehensive Troubleshooting FAQ"
Cohesion: 0.08
Nodes (23): 1. Port & Startup Conflicts, 2. Google OAuth & Authentication Errors, 3. Database & Storage Issues, `401: invalid_client (The OAuth client was not found)`, `403 access_denied: GistMyMail has not completed the Google verification process`, 4. AI Provider & Inference Errors, 5. Email Delivery & Scheduler Failures, 6. Frontend & Vite Proxy Problems (+15 more)

### Community 10 - "src/types.ts"
Cohesion: 0.09
Nodes (20): DigestCategorySchema, ExtractedActionRawSchema, ExtractedBatchResponseSchema, ExtractedEmailSummaryRawSchema, GenerateDigestRequestSchema, UpdateAccountLabelSchema, UpdateDeliveryPreferencesSchema, AIProviderType (+12 more)

### Community 11 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+13 more)

### Community 12 - "🚀 GistMyMail — Complete Local Setup & Development Guide"
Cohesion: 0.10
Nodes (20): 🚀 GistMyMail — Complete Local Setup & Development Guide, On macOS / Linux:, On Windows PowerShell:, Option A: Two Separate Terminals (Recommended), Option B: Combined Concurrently (Single Terminal), 🔍 Port Troubleshooting & Process Management, 🏗️ Production Build Verification, Run All Tests (+12 more)

### Community 13 - "ai/index.ts"
Cohesion: 0.19
Nodes (8): normalizeForComparison(), validateAndAggregateItems(), verifyEvidenceInSource(), MockAIProvider, OllamaAIProvider, OpenRouterAIProvider, AIProvider, AIProviderResult

### Community 15 - "🤖 GistMyMail — AI Providers & Inference Configuration"
Cohesion: 0.12
Nodes (16): 🌐 1. OpenRouter Gateway Setup, 💻 2. Ollama Local Inference (100% Private), 🛡️ 3. Prompt Injection Defense & Evidence Grounding, 🛠️ AI Troubleshooting Checklist, Deterministic Verifier (The Ground Truth Engine), 🤖 GistMyMail — AI Providers & Inference Configuration, Model Integrity & Anti-Silent-Fallback Verification, 🧭 Provider Comparison Matrix (+8 more)

### Community 16 - "🗄️ GistMyMail — PostgreSQL Database Setup Guide"
Cohesion: 0.12
Nodes (16): 1. In-Memory Mode (Default), 2. PostgreSQL Mode (Production & Persistent Development), 🛠️ Database Troubleshooting, 🗄️ GistMyMail — PostgreSQL Database Setup Guide, ☁️ Hosted PostgreSQL Options (Free & Recommended), 🔍 How to Verify Active PostgreSQL Connection, In-Memory Fallback:, 💻 Local PostgreSQL Setup (+8 more)

### Community 17 - "🚀 GistMyMail — Production Deployment Guide"
Cohesion: 0.12
Nodes (16): 1. Environment Variables in Dashboard, 1. Mandatory HTTPS, 2. Build & Start Commands, 2. Continuous Background Daemon Requirement, 3. Persistent Database, 🔐 Generating Production Cryptographic Secrets, 🚀 GistMyMail — Production Deployment Guide, ☁️ Option A: Deploy to Railway / Render (Recommended PaaS) (+8 more)

### Community 18 - "📬 GistMyMail — Email Digest Generation & Delivery Guide"
Cohesion: 0.13
Nodes (15): 🎛️ 1. Managing Connected Inboxes, ⚡ 2. On-Demand Digest Generation, 📤 3. Authorizing Gmail Sending (`gmail.send`), 🧪 4. Sending a Test Digest Email, ⏰ 5. Configuring Daily Scheduled Delivery, ⚙️ 6. How the Background Scheduler Works, Audit Logging & Feedback, Continuous Daemon (+7 more)

### Community 19 - "📋 Step-by-Step Setup Tutorial"
Cohesion: 0.13
Nodes (14): 🔑 GistMyMail — Complete Google Cloud OAuth 2.0 & Gmail API Guide, 🚀 Moving to Production & Google Verification, 🛠️ OAuth Troubleshooting Checklist, 🔐 Permission Scopes Principle (Least Privilege), Step 1: Create a Google Cloud Project, Step 2: Enable the Gmail API, Step 3: Configure the OAuth Consent Screen, Step 4: Configure Data Access & Exact Scopes (+6 more)

### Community 20 - "1. Google Cloud OAuth 2.0 Setup"
Cohesion: 0.13
Nodes (14): 1. Google Cloud OAuth 2.0 Setup, 2. AI Provider Configuration, 3. Database Configuration, 4. Environment Variables Dictionary, GistMyMail Integration & Setup Guide, Mode A: OpenRouter AI Gateway (Cloud / Free Tier), Mode B: Ollama (100% Private Local Inference), Mode C: Deterministic Mock Provider (Zero Setup / Fast Tests) (+6 more)

### Community 21 - "shared/package.json"
Cohesion: 0.14
Nodes (13): dependencies, zod, devDependencies, typescript, typescript, zod, main, name (+5 more)

### Community 22 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+5 more)

### Community 23 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

## Knowledge Gaps
- **330 isolated node(s):** `name`, `version`, `type`, `main`, `build` (+325 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `keywords` connect `keywords` to `app.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `fastify` connect `app.ts` to `keywords`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `📬 GistMyMail` connect `📬 GistMyMail` to `README.md`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `name`, `version`, `type` to the rest of the system?**
  _330 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10064935064935066 - nodes in this community are weakly interconnected._
- **Should `GistMyMail — Hackathon MVP Implementation Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `DatabaseRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.048625792811839326 - nodes in this community are weakly interconnected._