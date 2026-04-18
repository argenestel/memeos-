<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# MemeOS — UI Project Context

## What this project is
MemeOS is a live AI persona feed for crypto meme coin launches on Four.meme. The UI is a real-time dashboard where an AI (powered by a local OpenAI-compatible endpoint) gives hot takes on new coin launches through selectable personas.

## Stack
- **Framework:** Next.js 16.2.4 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + `tw-animate-css` + custom CSS variables in `app/globals.css`
- **Component library:** shadcn/ui (style: `base-nova`, aliases via `@/components/ui/`)
- **Icons:** lucide-react
- **Animation:** framer-motion
- **AI SDK:** Vercel AI SDK v6 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- **Theme:** next-themes (default: dark)
- **Utilities:** clsx, tailwind-merge (via `@/lib/utils`)

## AI / LLM setup
- Local OpenAI-compatible endpoint: `http://localhost:8317/v1`
- API key: `your-api-key-1`
- Model in use: `gemini-2.5-flash` (from Google, served via the local proxy)
- Streaming via `streamText` from `ai`, response returned as `result.toTextStreamResponse()`
- Client-side streaming via `useCompletion` from `@ai-sdk/react`

## File structure
```
ui/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # (placeholder) chat endpoint
│   │   └── completion/route.ts    # POST: streams AI hot take for a coin + persona
│   ├── components/
│   │   ├── CommentaryCard.tsx     # Single coin launch card with streaming AI take
│   │   ├── Feed.tsx               # Live feed, intervals simulate incoming launches
│   │   ├── Header.tsx             # Top nav with MemeOS branding + wallet button
│   │   ├── Sidebar.tsx            # Persona selector (Degen/Doomer/Moonboy/Boomer) + track record
│   │   └── ThemeProvider.tsx      # next-themes wrapper (client component)
│   ├── globals.css                # Tailwind v4 import, tw-animate-css, CSS vars, custom utilities
│   ├── layout.tsx                 # Root layout with Geist fonts + ThemeProvider
│   └── page.tsx                   # Main page: Header + Feed + Sidebar
├── components/
│   └── ui/                        # shadcn/ui generated components (button, card, badge)
├── lib/
│   └── utils.ts                   # cn() utility (clsx + tailwind-merge)
├── components.json                # shadcn config (style: base-nova, aliases: @/components)
├── package.json
└── tsconfig.json
```

## Personas
| ID       | Name         | Emoji | Vibe                                      |
|----------|--------------|-------|-------------------------------------------|
| degen    | The Degen    | 🦍    | High risk, max leverage, pure hype        |
| doomer   | The Doomer   | 📉    | Cynical, expects rugs, red flag spotter   |
| moonboy  | The Moonboy  | 🚀    | Overly optimistic, ignores red flags      |
| boomer   | The Boomer   | 👴    | Confused by tech, talks about fundamentals|

## Key conventions
- All client components start with `"use client"` directive
- shadcn components imported via `@/components/ui/...` alias
- Local app components live in `app/components/` and are imported relatively or via `@/app/components/`
- The AI streaming API route uses `streamText` and returns `result.toTextStreamResponse()` (NOT `toDataStreamResponse` — that method does not exist in this SDK version)
- `useCompletion` from `@ai-sdk/react` is used client-side; pass `body: { persona }` to route the prompt through the correct persona system prompt
- `tw-animate-css` is imported in `globals.css` via `@import "../node_modules/tw-animate-css/dist/tw-animate.css"`

## Known issues / fixes applied
- `toDataStreamResponse()` does not exist on `StreamTextResult` in this SDK version — use `toTextStreamResponse()` instead
- shadcn components are placed in `components/ui/` (project root), not `app/components/ui/`
- `tw-animate-css` must be installed (`npm install tw-animate-css`) — shadcn init adds the import automatically
- `ai/react` is a wrong import path — use `@ai-sdk/react` for `useCompletion`, `useChat`, etc.
