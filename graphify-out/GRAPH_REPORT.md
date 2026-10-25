# Graph Report - Gistmymail  (2026-10-25)

## Corpus Check
- 60 files · ~41,624 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 638 nodes · 801 edges · 29 communities (25 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `12d2045b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- api/package.json
- DatabaseRepository
- compilerOptions
- src/types.ts
- GistMyMail — Hackathon MVP Implementation Plan
- app.ts
- MemoryDatabaseRepository
- devDependencies
- GistMyMail
- package.json
- ai/index.ts
- getDatabase
- dependencies
- rules/graphify.md
- shared/package.json
- compilerOptions
- compilerOptions
- GistMyMail Evaluation & Hackathon Rubric Alignment
- App.tsx
- workflows/graphify.md
- 2. Core Subsystems
- validateAndAggregateItems
- 🛠️ GistMyMail — Comprehensive Troubleshooting FAQ
- 🤖 GistMyMail — AI Providers & Inference Configuration
- 🚀 GistMyMail — Production Deployment Guide
- 📬 GistMyMail — Email Digest Generation & Delivery Guide
- GistMyMail Security Model & Threat Defense
- client.ts

## God Nodes (most connected - your core abstractions)
1. `DatabaseRepository` - 25 edges
2. `PostgresDatabaseRepository` - 23 edges
3. `MemoryDatabaseRepository` - 22 edges
4. `getDatabase()` - 21 edges
5. `GistMyMail — Hackathon MVP Implementation Plan` - 19 edges
6. `compilerOptions` - 16 edges
7. `keywords` - 15 edges
8. `📬 GistMyMail` - 13 edges
9. `config` - 11 edges
10. `generateUserDigest()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `accountsRoutes()` --references--> `UpdateAccountLabelSchema`  [EXTRACTED]
  apps/api/src/routes/accounts.routes.ts → packages/shared/src/schemas.ts
- `deliveryRoutes()` --references--> `UpdateDeliveryPreferencesSchema`  [EXTRACTED]
  apps/api/src/routes/delivery.routes.ts → packages/shared/src/schemas.ts
- `digestRoutes()` --references--> `GenerateDigestRequestSchema`  [EXTRACTED]
  apps/api/src/routes/digest.routes.ts → packages/shared/src/schemas.ts
- `generateUserDigest()` --calls--> `validateAndAggregateItems()`  [EXTRACTED]
  apps/api/src/digest/generator.ts → apps/api/src/ai/aggregator/deterministic.ts
- `buildApp()` --indirect_call--> `accountsRoutes()`  [INFERRED]
  apps/api/src/app.ts → apps/api/src/routes/accounts.routes.ts

## Import Cycles
- None detected.

## Communities (29 total, 4 thin omitted)

### Community 0 - "api/package.json"
Cohesion: 0.05
Nodes (37): dependencies, fastify, @fastify/cookie, @fastify/cors, @gistmymail/shared, googleapis, pg, zod (+29 more)

### Community 2 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+13 more)

### Community 3 - "src/types.ts"
Cohesion: 0.09
Nodes (19): DigestCategorySchema, ExtractedActionRawSchema, ExtractedBatchResponseSchema, GenerateDigestRequestSchema, UpdateAccountLabelSchema, UpdateDeliveryPreferencesSchema, AIProviderType, ConnectedAccount (+11 more)

### Community 4 - "GistMyMail — Hackathon MVP Implementation Plan"
Cohesion: 0.04
Nodes (45): 10. AI provider configuration, 11. Background job design and Docker, 12. Google OAuth verification and realistic limitations, 13. Repeatable test plan, 14. Suggested repository structure, 15. Prioritized implementation checklist, 16. Exact acceptance criteria, 17. Features to postpone deliberately (+37 more)

### Community 5 - "app.ts"
Cohesion: 0.13
Nodes (30): getAIProvider(), buildApp(), BASE_SCOPES, exchangeOAuthCode(), generateGoogleAuthUrl(), getAuthorizedGmailClient(), getOAuth2Client(), AppConfig (+22 more)

### Community 7 - "devDependencies"
Cohesion: 0.06
Nodes (34): dependencies, clsx, @gistmymail/shared, lucide-react, react, react-dom, devDependencies, tailwindcss (+26 more)

### Community 8 - "GistMyMail"
Cohesion: 0.08
Nodes (25): 1. Local Ollama (Recommended for Privacy), 1. Prerequisites, 2. Clone & Install, 2. OpenRouter Gateway (Cloud / Free Tier), 3. Deterministic Mock (Instant Offline Testing), 3. Environment Configuration, 4. Build Monorepo, 5. Run Automated Tests (+17 more)

### Community 9 - "package.json"
Cohesion: 0.05
Nodes (35): description, engines, node, keywords, name, packageManager, pnpm, onlyBuiltDependencies (+27 more)

### Community 10 - "ai/index.ts"
Cohesion: 0.25
Nodes (6): MockAIProvider, OllamaAIProvider, OpenRouterAIProvider, AIProvider, AIProviderResult, ExtractedEmailSummaryRawSchema

### Community 11 - "getDatabase"
Cohesion: 0.10
Nodes (20): 🚀 GistMyMail — Complete Local Setup & Development Guide, On macOS / Linux:, On Windows PowerShell:, Option A: Two Separate Terminals (Recommended), Option B: Combined Concurrently (Single Terminal), 🔍 Port Troubleshooting & Process Management, 🏗️ Production Build Verification, Run All Tests (+12 more)

### Community 12 - "dependencies"
Cohesion: 0.13
Nodes (14): 🔑 GistMyMail — Complete Google Cloud OAuth 2.0 & Gmail API Guide, 🚀 Moving to Production & Google Verification, 🛠️ OAuth Troubleshooting Checklist, 🔐 Permission Scopes Principle (Least Privilege), Step 1: Create a Google Cloud Project, Step 2: Enable the Gmail API, Step 3: Configure the OAuth Consent Screen, Step 4: Configure Data Access & Exact Scopes (+6 more)

### Community 14 - "shared/package.json"
Cohesion: 0.14
Nodes (13): dependencies, zod, devDependencies, typescript, typescript, zod, main, name (+5 more)

### Community 15 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+5 more)

### Community 16 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 17 - "GistMyMail Evaluation & Hackathon Rubric Alignment"
Cohesion: 0.06
Nodes (28): 1. High-Level System Architecture, 2.1 Multi-Inbox Ingestion & Purpose Labeling, 2.2 The Deterministic Evidence Verifier (The Guardrail), 2.3 Prompt Injection Defense & Quarantine, 2.4 Resilient Dual-Mode Database Layer, 2.5 Multi-Provider AI Inference Gateway, 2. Core Subsystems, 3. Data Models & Schemas (+20 more)

### Community 18 - "App.tsx"
Cohesion: 0.04
Nodes (46): **Automated Test Matrix:**, **Core Data Pipeline:**, **End-to-End User Experience:**, **Get Started & Open Source Links:**, 📬 GistMyMail, 📑 GistMyMail — Hackathon Presentation Deck (6 Slides), **Hack Day Jaipur 2026 — 3 Repeat Runs Benchmark Matrix:**, **Headline:** (+38 more)

### Community 21 - "2. Core Subsystems"
Cohesion: 0.13
Nodes (14): 1. Google Cloud OAuth 2.0 Setup, 2. AI Provider Configuration, 3. Database Configuration, 4. Environment Variables Dictionary, GistMyMail Integration & Setup Guide, Mode A: OpenRouter AI Gateway (Cloud / Free Tier), Mode B: Ollama (100% Private Local Inference), Mode C: Deterministic Mock Provider (Zero Setup / Fast Tests) (+6 more)

### Community 22 - "validateAndAggregateItems"
Cohesion: 0.90
Nodes (3): normalizeForComparison(), validateAndAggregateItems(), verifyEvidenceInSource()

### Community 23 - "🛠️ GistMyMail — Comprehensive Troubleshooting FAQ"
Cohesion: 0.08
Nodes (23): 1. Port & Startup Conflicts, 2. Google OAuth & Authentication Errors, 3. Database & Storage Issues, `401: invalid_client (The OAuth client was not found)`, `403 access_denied: GistMyMail has not completed the Google verification process`, 4. AI Provider & Inference Errors, 5. Email Delivery & Scheduler Failures, 6. Frontend & Vite Proxy Problems (+15 more)

### Community 24 - "🤖 GistMyMail — AI Providers & Inference Configuration"
Cohesion: 0.12
Nodes (16): 🌐 1. OpenRouter Gateway Setup, 💻 2. Ollama Local Inference (100% Private), 🛡️ 3. Prompt Injection Defense & Evidence Grounding, 🛠️ AI Troubleshooting Checklist, Deterministic Verifier (The Ground Truth Engine), 🤖 GistMyMail — AI Providers & Inference Configuration, Model Integrity & Anti-Silent-Fallback Verification, 🧭 Provider Comparison Matrix (+8 more)

### Community 25 - "🚀 GistMyMail — Production Deployment Guide"
Cohesion: 0.12
Nodes (16): 1. Environment Variables in Dashboard, 1. Mandatory HTTPS, 2. Build & Start Commands, 2. Continuous Background Daemon Requirement, 3. Persistent Database, 🔐 Generating Production Cryptographic Secrets, 🚀 GistMyMail — Production Deployment Guide, ☁️ Option A: Deploy to Railway / Render (Recommended PaaS) (+8 more)

### Community 26 - "📬 GistMyMail — Email Digest Generation & Delivery Guide"
Cohesion: 0.12
Nodes (15): 🎛️ 1. Managing Connected Inboxes, ⚡ 2. On-Demand Digest Generation, 📤 3. Authorizing Gmail Sending (`gmail.send`), 🧪 4. Sending a Test Digest Email, ⏰ 5. Configuring Daily Scheduled Delivery, ⚙️ 6. How the Background Scheduler Works, Audit Logging & Feedback, Continuous Daemon (+7 more)

### Community 27 - "GistMyMail Security Model & Threat Defense"
Cohesion: 0.12
Nodes (16): 1. In-Memory Mode (Default), 2. PostgreSQL Mode (Production & Persistent Development), 🛠️ Database Troubleshooting, 🗄️ GistMyMail — PostgreSQL Database Setup Guide, ☁️ Hosted PostgreSQL Options (Free & Recommended), 🔍 How to Verify Active PostgreSQL Connection, In-Memory Fallback:, 💻 Local PostgreSQL Setup (+8 more)

### Community 28 - "client.ts"
Cohesion: 0.64
Nodes (5): fetchAccountEmails(), getMockEmailsForAccount(), cleanHtmlToText(), createContentHash(), parseSender()

## Knowledge Gaps
- **340 isolated node(s):** `name`, `version`, `type`, `main`, `build` (+335 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `keywords` connect `package.json` to `app.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `fastify` connect `app.ts` to `package.json`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `📬 GistMyMail` connect `GistMyMail` to `GistMyMail Evaluation & Hackathon Rubric Alignment`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `name`, `version`, `type` to the rest of the system?**
  _340 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `DatabaseRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.048625792811839326 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._