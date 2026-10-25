# Graph Report - Gistmymail  (2026-10-25)

## Corpus Check
- 48 files · ~23,524 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 395 nodes · 549 edges · 21 communities (17 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `419d848a`
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
- validateAndAggregateItems
- workflows/graphify.md

## God Nodes (most connected - your core abstractions)
1. `DatabaseRepository` - 25 edges
2. `PostgresDatabaseRepository` - 23 edges
3. `MemoryDatabaseRepository` - 22 edges
4. `getDatabase()` - 21 edges
5. `GistMyMail — Hackathon MVP Implementation Plan` - 19 edges
6. `compilerOptions` - 16 edges
7. `generateUserDigest()` - 11 edges
8. `compilerOptions` - 11 edges
9. `config` - 10 edges
10. `compilerOptions` - 10 edges

## Surprising Connections (you probably didn't know these)
- `accountsRoutes()` --references--> `UpdateAccountLabelSchema`  [EXTRACTED]
  apps/api/src/routes/accounts.routes.ts → packages/shared/src/schemas.ts
- `digestRoutes()` --references--> `GenerateDigestRequestSchema`  [EXTRACTED]
  apps/api/src/routes/digest.routes.ts → packages/shared/src/schemas.ts
- `deliveryRoutes()` --references--> `UpdateDeliveryPreferencesSchema`  [EXTRACTED]
  apps/api/src/routes/delivery.routes.ts → packages/shared/src/schemas.ts
- `buildApp()` --indirect_call--> `digestRoutes()`  [INFERRED]
  apps/api/src/app.ts → apps/api/src/routes/digest.routes.ts
- `generateUserDigest()` --calls--> `validateAndAggregateItems()`  [EXTRACTED]
  apps/api/src/digest/generator.ts → apps/api/src/ai/aggregator/deterministic.ts

## Import Cycles
- None detected.

## Communities (21 total, 4 thin omitted)

### Community 0 - "api/package.json"
Cohesion: 0.09
Nodes (22): devDependencies, tsx, @types/node, @types/pg, typescript, vitest, typescript, main (+14 more)

### Community 2 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+13 more)

### Community 3 - "src/types.ts"
Cohesion: 0.10
Nodes (18): DigestCategorySchema, ExtractedActionRawSchema, ExtractedBatchResponseSchema, GenerateDigestRequestSchema, UpdateAccountLabelSchema, AIProviderType, ConnectedAccount, DeliveryLog (+10 more)

### Community 4 - "GistMyMail — Hackathon MVP Implementation Plan"
Cohesion: 0.04
Nodes (45): 10. AI provider configuration, 11. Background job design and Docker, 12. Google OAuth verification and realistic limitations, 13. Repeatable test plan, 14. Suggested repository structure, 15. Prioritized implementation checklist, 16. Exact acceptance criteria, 17. Features to postpone deliberately (+37 more)

### Community 5 - "app.ts"
Cohesion: 0.17
Nodes (17): buildApp(), BASE_SCOPES, exchangeOAuthCode(), generateGoogleAuthUrl(), getOAuth2Client(), AppConfig, config, EnvSchema (+9 more)

### Community 7 - "devDependencies"
Cohesion: 0.06
Nodes (34): dependencies, clsx, @gistmymail/shared, lucide-react, react, react-dom, devDependencies, tailwindcss (+26 more)

### Community 8 - "GistMyMail"
Cohesion: 0.10
Nodes (20): 1. Prerequisites, 2. Install Dependencies, 3. Build Monorepo, 3 Repeat Runs Benchmark Results, 4. Run Tests & Repeat Runs Benchmark, 5. Start Development Servers, Approach, Architecture & Demo, Core Flow (+12 more)

### Community 9 - "package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, name, packageManager, pnpm, onlyBuiltDependencies, private (+10 more)

### Community 10 - "ai/index.ts"
Cohesion: 0.25
Nodes (6): MockAIProvider, OllamaAIProvider, OpenRouterAIProvider, AIProvider, AIProviderResult, ExtractedEmailSummaryRawSchema

### Community 11 - "getDatabase"
Cohesion: 0.19
Nodes (18): getAIProvider(), getAuthorizedGmailClient(), getDatabase(), processDueDelivery(), startDeliveryScheduler(), generateUserDigest(), groupItems(), renderHtmlDigest() (+10 more)

### Community 12 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, fastify, @fastify/cookie, @fastify/cors, @gistmymail/shared, googleapis, pg, zod (+7 more)

### Community 14 - "shared/package.json"
Cohesion: 0.14
Nodes (13): dependencies, zod, devDependencies, typescript, typescript, zod, main, name (+5 more)

### Community 15 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+5 more)

### Community 16 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 17 - "validateAndAggregateItems"
Cohesion: 0.90
Nodes (3): normalizeForComparison(), validateAndAggregateItems(), verifyEvidenceInSource()

## Knowledge Gaps
- **169 isolated node(s):** `name`, `version`, `type`, `main`, `build` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DatabaseRepository` connect `DatabaseRepository` to `MemoryDatabaseRepository`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `MemoryDatabaseRepository` connect `MemoryDatabaseRepository` to `DatabaseRepository`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `version`, `type` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `DatabaseRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.051515151515151514 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `src/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._