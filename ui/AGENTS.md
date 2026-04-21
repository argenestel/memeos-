<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# MemeOS — UI Project Context

## What this project is
MemeOS is a live AI persona feed for crypto meme coin launches on Four.meme. The UI polls real token data, streams AI hot takes per persona via a local LLM proxy, caches all takes in Supabase, and lets users one-click buy via Four.meme. Wallet connection is handled by RainbowKit + wagmi.

## Stack
- **Framework:** Next.js 16.2.4 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + `tw-animate-css` + custom CSS variables in `app/globals.css`
- **Component library:** shadcn/ui (style: `base-nova`, aliases via `@/components/ui/`)
- **Icons:** lucide-react
- **Animation:** framer-motion (AnimatePresence + motion.div on cards)
- **AI SDK:** Vercel AI SDK v6 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- **Database:** Supabase (Postgres) via `postgres` package (direct SQL, no ORM)
- **Theme:** next-themes (default: dark, suppressHydrationWarning on html)
- **Wallet:** RainbowKit + wagmi + @tanstack/react-query, chain: BSC only
- **Utilities:** clsx, tailwind-merge (via `@/lib/utils`), zod (for AI structured output)

## AI / LLM setup
- Local OpenAI-compatible endpoint: `http://localhost:8317/v1`
- API key: `your-api-key-1`
- **Model:** `gemini-3.1-flash-lite-preview`
- Server-side streaming via `streamObject` with Zod schema → `result.toTextStreamResponse()`
- Client-side streaming via `experimental_useObject as useObject` from `@ai-sdk/react`
- `maxOutputTokens` is the correct param name (NOT `maxTokens`) in this SDK version
- **Each persona has a deeply polarized system prompt** with forced opinion direction and strict behavioral rules so they never agree with each other

## Supabase database
- **Connection:** `postgresql://postgres:RatEEvq%23fx17ay404GwA@db.ugkucjbnwgohmmhdebri.supabase.co:5432/postgres`
- **Client:** `lib/db.ts` exports a `postgres` instance with `ssl: 'require'`
- **Table:** `token_analyses`
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `token_address` TEXT NOT NULL
  - `persona` TEXT NOT NULL
  - `take` TEXT NOT NULL
  - `created_at` TIMESTAMP WITH TIME ZONE DEFAULT now()
  - **UNIQUE(token_address, persona)** — prevents duplicate takes
- **Init script:** `scripts/init_db.ts` creates the table

## Caching flow
1. `TokenCard` mounts → calls `GET /api/analysis?address=...&persona=...`
2. If cached take exists → display instantly (no AI call, no streaming)
3. If no cache → call `POST /api/completion` with `{ persona, prompt, tokenAddress }`
4. On stream finish, `/api/completion` saves the take to Supabase via `onFinish` callback
5. Next time the same token+persona combo is viewed, it loads from cache

## Four.meme API
- **Token list:** `POST https://four.meme/meme-api/v1/public/token/search`
  - Body: `{ pageIndex, pageSize, type: "NEW"|"HOT", listType: "ADV" }`
- **Token detail:** `GET https://four.meme/meme-api/v1/private/token/get/v2?address=0x...`
- Proxied via Next.js API routes:
  - `GET /api/tokens?page=1&size=40&type=NEW`
  - `GET /api/token?address=0x...`
  - `GET /api/market-stats` (trending, rugged, fear/greed)
  - `GET /api/analysis?address=0x...&persona=degen`
- Helpers in `lib/fourmeme.ts`: `formatCap`, `formatIncrease`, `formatProgress`, `imgUrl`

## File structure
```
ui/
├── app/
│   ├── api/
│   │   ├── analysis/route.ts     # GET: check Supabase for cached take
│   │   ├── completion/route.ts   # POST: stream AI take + save to Supabase on finish
│   │   ├── market-stats/route.ts# GET: trending, rugged, fear/greed index
│   │   ├── token/route.ts       # GET: proxies four.meme token detail
│   │   └── tokens/route.ts      # GET: proxies four.meme token list search
│   ├── components/
│   │   ├── Feed.tsx              # Polls /api/tokens every 30s, renders TokenCard per token
│   │   ├── Header.tsx            # Top nav, MemeOS brand, RainbowKit ConnectButton
│   │   ├── Sidebar.tsx           # Persona selector + track record + trending/rugged (fetched from /api/market-stats)
│   │   └── ThemeProvider.tsx     # next-themes wrapper (client component)
│   ├── globals.css               # Tailwind v4, tw-animate-css, CSS vars, keyframe animations
│   ├── layout.tsx                # Root layout, Geist fonts, ThemeProvider
│   └── page.tsx                  # "use client", persona state, WagmiProvider, RainbowKitProvider, StatsPanel
├── components/
│   └── ui/                       # shadcn/ui: button.tsx, card.tsx, badge.tsx
├── lib/
│   ├── db.ts                     # postgres client (Supabase, ssl: require)
│   ├── fourmeme.ts               # Four.meme fetch helpers + type definitions
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
├── scripts/
│   └── init_db.ts                # Run once: creates token_analyses table
├── .env.local                    # DATABASE_URL for Supabase
├── components.json               # shadcn config
└── package.json
```

## Personas (deeply polarized)
| ID       | Name         | Emoji | Forced Opinion Direction                              |
|----------|--------------|-------|-------------------------------------------------------|
| degen    | The Degen    | 🦍    | ALWAYS buys. Every metric is bullish. Uses degenerate slang. |
| doomer   | The Doomer   | 📉    | ALWAYS hates it. Picks apart every red flag. Bitter and sarcastic. |
| moonboy  | Moonboy      | 🚀    | ALWAYS predicts 1000x. Rockets, caps, delusion. Never sees risk. |
| boomer   | The Boomer   | 👴    | ALWAYS compares to stocks. Confused, asks about dividends, accidentally insightful. |

Default active persona: `"degen"` (set in page.tsx useState)

## Data flow
1. `page.tsx` holds `activePersona` state, passes down to `Feed` and `Sidebar`
2. `Feed` polls `/api/tokens` every 30s, deduplicates by `tokenId`, caps at 40 cards
3. Each `TokenCard` on mount:
   a. Checks `/api/analysis` for a cached take in Supabase
   b. If cached → display instantly, no AI call
   c. If not cached → calls `POST /api/completion` with `{ persona, prompt, tokenAddress }`
4. `/api/completion` streams AI take via `streamObject` + Zod `{ take: string }`
5. On finish, `/api/completion` saves the take to `token_analyses` in Supabase
6. Sidebar fetches `/api/market-stats` for trending tokens, rugged tokens, fear/greed index

## Key conventions
- All client components start with `"use client"` directive
- shadcn components imported via `@/components/ui/...` (NOT `./ui/...`)
- `experimental_useObject as useObject` from `@ai-sdk/react` (NOT `useObject` directly, NOT `useCompletion`)
- `streamObject` with Zod schema for structured AI output (NOT `streamText`)
- `maxOutputTokens` is correct (NOT `maxTokens`) in AI SDK v6
- `result.toTextStreamResponse()` for streaming (NOT `toDataStreamResponse`)
- CSS variables from `globals.css` used inline (`var(--orange)`, `var(--green)`, etc.)
- Images from four.meme use `imgUrl()` helper to prefix `https://static.four.meme`
- npm installs require `--legacy-peer-deps` due to rainbowkit/wagmi version conflict
- `postgres` package for Supabase (NOT Prisma, NOT supabase-js)

## Known issues fixed
- `toDataStreamResponse()` → use `toTextStreamResponse()`
- `maxTokens` → use `maxOutputTokens`
- `ai/react` → use `@ai-sdk/react`
- `useObject` → use `experimental_useObject as useObject` from `@ai-sdk/react`
- `streamText` → use `streamObject` for structured JSON output
- shadcn components in `components/ui/` not `app/components/ui/`
- `tw-animate-css` must be installed: `npm install tw-animate-css`
- Feed default persona was `"all"` → changed to `"degen"` to always pass a valid persona to AI