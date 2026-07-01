# Dolphin Uncensored Pro (v1)

A premium dark-mode AI coding chat app powered by the Dolphin Mistral 24B Venice Edition via OpenRouter. Multi-file code generation, file/image upload, streaming responses, and conversation history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/dolphin-chat run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secret: `OPENROUTER_API_KEY` — OpenRouter API key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, react-markdown, react-syntax-highlighter
- API: Express 5 with SSE streaming
- DB: PostgreSQL + Drizzle ORM (conversations + messages tables)
- AI: OpenRouter API — Dolphin Mistral 24B (text/code), Google Gemma 3 27B (vision fallback)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/conversations.ts` — DB schema: conversations + messages tables
- `artifacts/api-server/src/routes/chat.ts` — Streaming chat route (SSE)
- `artifacts/api-server/src/routes/conversations.ts` — Conversation CRUD routes
- `artifacts/dolphin-chat/src/` — React frontend

## Architecture decisions

- Streaming via SSE: the `/api/chat/complete` endpoint streams OpenRouter responses as `data: {chunk}` events. Frontend reads with native `fetch` + `ReadableStream`.
- Vision fallback: if the request contains `imageBase64`, the backend automatically routes to Google Gemma 3 27B instead of Dolphin.
- No auth: single-user app, no authentication required.
- System prompt is server-side only: the uncensored developer system prompt is injected server-side and never exposed to the client.

## Product

- Dark-mode chat UI modeled after miniapps.ai with streaming AI responses
- File/image upload: code files are sent as text context; images are base64-encoded and sent to the vision model
- Per-message code block download (auto-detects language → correct file extension)
- Conversation history sidebar with delete
- Scroll-to-bottom floating button
- Footer: "Built and Engineered by NativeCodes | Powered by Dolphin Core"

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before touching the frontend or backend.
- The SSE streaming endpoint uses `res.flushHeaders()` — do not add buffering middleware before it.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
