# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Pax Mentis (artifacts/pax-mentis)

Android/iOS Expo uygulaması. Erteleme davranışını psikolojik bilimle ele alan yerel AI destekli mentorluk uygulaması.

**Özellikler:**
- 4 tab: Ana Sayfa (Bento Grid), Mentor (sohbet), Görevler, Wiki
- Yerel LLM köprüsü (lib/localLLM.ts) — Gemma / Llama on-device model için hazır
- Wiki bilgi tabanı (lib/wikiKnowledge.ts) — TMT, PSI, ACT, Kahneman, Atomic Habits, Pychyl
- RAG tabanlı bağlamsal içerik enjeksiyonu (retrieveRelevantChunks)
- Direnç analizi (lib/resistanceAnalyzer.ts) — latency ölçümü + kelime analizi
- Sokratik mentor sohbeti + streaming
- AsyncStorage ile görev + oturum kalıcılığı
- Zen renk paleti: Sage Green (#5a7a5a), Soft Sand, Pearl White

**Renk sistemi:** constants/colors.ts — light + dark mode
**Global state:** context/AppContext.tsx — görevler, oturumlar, istatistikler
