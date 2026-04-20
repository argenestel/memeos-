<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# MemeOS — UI Project Context

## What this project is
MemeOS is a live AI persona feed for crypto meme coin launches on Four.meme. The UI polls real token data, streams AI hot takes per persona via a local LLM proxy, and lets users one-click buy via Four.meme. Wallet connection is handled by RainbowKit + wagmi.

## Stack
- **Framework:** Next.js 16.2.4 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + `tw-animate-css` + custom CSS variables in `app/globals.css`
- **Component library:** shadcn/ui (style: `base-nova`, aliases via `@/components/ui/`)
- **Icons:** lucide-react
- **Animation:** framer-motion (AnimatePresence + motion.div on cards)
- **AI SDK:** Vercel AI SDK v6 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- **Theme:** next-themes (default: dark, suppressHydrationWarning on html)
- **Wallet:** RainbowKit + wagmi + @tanstack/react-query, chain: BSC only
- **Utilities:** clsx, tailwind-merge (via `@/lib/utils`)

## AI / LLM setup
- Local OpenAI-compatible endpoint: `http://localhost:8317/v1`
- API key: `your-api-key-1`
- **Model:** `gemini-3.1-flash-preview`
- Server-side streaming via `streamText` → `result.toTextStreamResponse()` (NOT `toDataStreamResponse`)
- Client-side streaming via `useCompletion` from `@ai-sdk/react`
- `maxOutputTokens` is the correct param name (NOT `maxTokens`) in this SDK version

## Four.meme API
- **Token list:** `POST https://four.meme/meme-api/v1/public/token/search`
  - Body: `{ pageIndex, pageSize, type: "NEW"|"HOT", listType: "ADV" }`
  - Returns array of tokens with: tokenId, name, shortName, tokenAddress, price, cap, hold, img, increase, day1Vol, progress, createDate
- **Token detail:** `GET https://four.meme/meme-api/v1/private/token/get/v2?address=0x...`
  - Returns full detail including tokenPrice (marketCap, liquidity, holderCount, progress, raisedAmount)
- Both are proxied via Next.js API routes to avoid CORS:
  - `GET /api/tokens?page=1&size=20&type=NEW` → returns `{ tokens: FourMemeToken[] }`
  - `GET /api/token?address=0x...` → returns `{ detail: FourMemeTokenDetail }`
- Helper functions in `lib/fourmeme.ts`: `formatCap`, `formatIncrease`, `formatProgress`, `imgUrl`

## File structure
```
ui/
├── app/
│   ├── api/
│   │   ├── completion/route.ts    # POST: streams AI hot take (persona system prompts here)
│   │   ├── token/route.ts         # GET: proxies four.meme token detail
│   │   └── tokens/route.ts        # GET: proxies four.meme token list search
│   ├── components/
│   │   ├── Feed.tsx               # Polls /api/tokens every 30s, renders TokenCard per token
│   │   ├── Header.tsx             # Top nav, MemeOS brand, RainbowKit ConnectButton
│   │   ├── Sidebar.tsx            # Persona selector + track record + trending/rugged panels
│   │   └── ThemeProvider.tsx      # next-themes wrapper (client component)
│   ├── globals.css                # Tailwind v4, tw-animate-css, CSS vars, animation keyframes
│   ├── layout.tsx                 # Root layout, Geist fonts, ThemeProvider
│   └── page.tsx                   # "use client", persona state, WagmiProvider, RainbowKitProvider, layout
├── components/
│   └── ui/                        # shadcn/ui generated: button.tsx, card.tsx, badge.tsx
├── lib/
│   ├── fourmeme.ts                # Four.meme fetch helpers + type definitions
│   └── utils.ts                   # cn() utility (clsx + tailwind-merge)
├── components.json                # shadcn config
└── package.json
```

## Personas
| ID       | Name         | Emoji | Vibe                                         |
|----------|--------------|-------|----------------------------------------------|
| degen    | The Degen    | 🦍    | Apes everything, max leverage, pure hype     |
| doomer   | The Doomer   | 📉    | Cynical, assumes every coin is a honeypot    |
| moonboy  | Moonboy      | 🚀    | Relentlessly optimistic, 1000x everything    |
| boomer   | The Boomer   | 👴    | Confused by crypto, asks about dividends     |

Default active persona: `"degen"` (set in page.tsx useState)

## Data flow
1. `page.tsx` holds `activePersona` state, passes down to `Feed` and `Sidebar`
2. `Feed` polls `/api/tokens` every 30s, deduplicates by `tokenId`, caps at 40 cards
3. Each `TokenCard` (inside Feed.tsx) calls `useCompletion` on mount → hits `/api/completion`
4. `/api/completion` builds a persona-specific system prompt + injects token context → streams via `gemini-3.1-flash-lite-preview`
5. Completion streams back to the card and types out in real time

## Key conventions
- All client components start with `"use client"` directive
- shadcn components imported via `@/components/ui/...` (NOT `./ui/...`)
- `useCompletion` from `@ai-sdk/react` (NOT `ai/react`)
- `streamText` returns `result.toTextStreamResponse()` (NOT `toDataStreamResponse`)
- `maxOutputTokens` is correct (NOT `maxTokens`) in AI SDK v6
- CSS variables from `globals.css` used inline (`var(--orange)`, `var(--green)`, etc.)
- Images from four.meme use `imgUrl()` helper to prefix `https://static.four.meme`

## Known issues fixed
- `toDataStreamResponse()` → use `toTextStreamResponse()`
- `maxTokens` → use `maxOutputTokens`
- `ai/react` → use `@ai-sdk/react`
- shadcn components in `components/ui/` not `app/components/ui/`
- `tw-animate-css` must be installed: `npm install tw-animate-css`
- Feed default persona was `"all"` → changed to `"degen"` to always pass a valid persona to AI
