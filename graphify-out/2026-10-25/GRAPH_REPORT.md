# Graph Report - Gistmymail  (2026-10-25)

## Corpus Check
- 54 files · ~30,965 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 500 nodes · 663 edges · 23 communities (19 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a220292`
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

## Communities (23 total, 4 thin omitted)

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
Cohesion: 0.11
Nodes (35): getAIProvider(), buildApp(), BASE_SCOPES, exchangeOAuthCode(), generateGoogleAuthUrl(), getAuthorizedGmailClient(), getOAuth2Client(), AppConfig (+27 more)

### Community 7 - "devDependencies"
Cohesion: 0.06
Nodes (34): dependencies, clsx, @gistmymail/shared, lucide-react, react, react-dom, devDependencies, tailwindcss (+26 more)

### Community 8 - "GistMyMail"
Cohesion: 0.08
Nodes (25): 1. Local Ollama (Recommended for Privacy), 1. Prerequisites, 2. Clone & Install, 2. OpenRouter Gateway (Cloud / Free Tier), 3. Deterministic Mock (Instant Offline Testing), 3. Environment Configuration, 4. Build Monorepo, 5. Run Automated Tests (+17 more)

### Community 9 - "package.json"
Cohesion: 0.09
Nodes (21): description, engines, node, name, packageManager, pnpm, onlyBuiltDependencies, private (+13 more)

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
Cohesion: 0.20
Nodes (9): 1. Hackathon Metadata, 2. 3 Repeat Test Runs Benchmark Table, 3. Automated Test Coverage (Vitest), 4. Special Graphify Award Submission, Benchmark Takeaways:, GistMyMail Evaluation & Hackathon Rubric Alignment, Graph Metrics:, Verified Test Cases: (+1 more)

### Community 18 - "App.tsx"
Cohesion: 0.12
Nodes (14): keywords, ai, cipher, dev, devrelay, email-digest, graphify, hacktoberfest (+6 more)

### Community 21 - "2. Core Subsystems"
Cohesion: 0.05
Nodes (33): 1. High-Level System Architecture, 2.1 Multi-Inbox Ingestion & Purpose Labeling, 2.2 The Deterministic Evidence Verifier (The Guardrail), 2.3 Prompt Injection Defense & Quarantine, 2.4 Resilient Dual-Mode Database Layer, 2.5 Multi-Provider AI Inference Gateway, 2. Core Subsystems, 3. Data Models & Schemas (+25 more)

### Community 22 - "validateAndAggregateItems"
Cohesion: 0.90
Nodes (3): normalizeForComparison(), validateAndAggregateItems(), verifyEvidenceInSource()

## Knowledge Gaps
- **245 isolated node(s):** `name`, `version`, `type`, `main`, `build` (+240 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `keywords` connect `App.tsx` to `package.json`, `app.ts`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `fastify` connect `app.ts` to `App.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `GistMyMail — Hackathon MVP Implementation Plan` connect `GistMyMail — Hackathon MVP Implementation Plan` to `2. Core Subsystems`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `name`, `version`, `type` to the rest of the system?**
  _245 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `DatabaseRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.051515151515151514 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._