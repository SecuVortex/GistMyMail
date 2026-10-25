# Graph Report - .  (2026-10-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 322 nodes · 477 edges · 20 communities (17 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17

## God Nodes (most connected - your core abstractions)
1. `DatabaseRepository` - 25 edges
2. `PostgresDatabaseRepository` - 23 edges
3. `MemoryDatabaseRepository` - 22 edges
4. `getDatabase()` - 21 edges
5. `compilerOptions` - 16 edges
6. `generateUserDigest()` - 11 edges
7. `compilerOptions` - 11 edges
8. `compilerOptions` - 10 edges
9. `AIProvider` - 9 edges
10. `config` - 9 edges

## Surprising Connections (you probably didn't know these)
- `accountsRoutes()` --references--> `UpdateAccountLabelSchema`  [EXTRACTED]
  apps/api/src/routes/accounts.routes.ts → packages/shared/src/schemas.ts
- `deliveryRoutes()` --references--> `UpdateDeliveryPreferencesSchema`  [EXTRACTED]
  apps/api/src/routes/delivery.routes.ts → packages/shared/src/schemas.ts
- `digestRoutes()` --references--> `GenerateDigestRequestSchema`  [EXTRACTED]
  apps/api/src/routes/digest.routes.ts → packages/shared/src/schemas.ts
- `buildApp()` --indirect_call--> `digestRoutes()`  [INFERRED]
  apps/api/src/app.ts → apps/api/src/routes/digest.routes.ts
- `generateUserDigest()` --calls--> `validateAndAggregateItems()`  [EXTRACTED]
  apps/api/src/digest/generator.ts → apps/api/src/ai/aggregator/deterministic.ts

## Import Cycles
- None detected.

## Communities (20 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (22): devDependencies, tsx, @types/node, @types/pg, typescript, vitest, typescript, main (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (19): DigestCategorySchema, ExtractedActionRawSchema, ExtractedBatchResponseSchema, GenerateDigestRequestSchema, UpdateAccountLabelSchema, UpdateDeliveryPreferencesSchema, AIProviderType, ConnectedAccount (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (12): buildApp(), AppConfig, config, EnvSchema, loadConfig(), getDatabase(), startDeliveryScheduler(), main() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): dependencies, clsx, @gistmymail/shared, lucide-react, react, react-dom, @gistmymail/shared, name (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (13): BASE_SCOPES, exchangeOAuthCode(), generateGoogleAuthUrl(), getAuthorizedGmailClient(), getOAuth2Client(), fetchAccountEmails(), getMockEmailsForAccount(), cleanHtmlToText() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (18): description, engines, node, name, packageManager, pnpm, onlyBuiltDependencies, private (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.26
Nodes (6): MockAIProvider, OllamaAIProvider, OpenRouterAIProvider, AIProvider, AIProviderResult, ExtractedEmailSummaryRawSchema

### Community 11 - "Community 11"
Cohesion: 0.32
Nodes (9): getAIProvider(), processDueDelivery(), generateUserDigest(), groupItems(), renderHtmlDigest(), renderPlainTextDigest(), createMimeMessage(), sendDigestEmail() (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (15): dependencies, fastify, @fastify/cookie, @fastify/cors, @gistmymail/shared, googleapis, pg, zod (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (15): devDependencies, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (13): dependencies, zod, devDependencies, typescript, typescript, zod, main, name (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir (+5 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.90
Nodes (3): normalizeForComparison(), validateAndAggregateItems(), verifyEvidenceInSource()

## Knowledge Gaps
- **120 isolated node(s):** `name`, `version`, `type`, `main`, `build` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DatabaseRepository` connect `Community 1` to `Community 4`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `PostgresDatabaseRepository` connect `Community 4` to `Community 1`, `Community 5`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `MemoryDatabaseRepository` connect `Community 6` to `Community 1`, `Community 5`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `name`, `version`, `type` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09486166007905138 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._