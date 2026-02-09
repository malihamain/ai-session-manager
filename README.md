# AI Session Manager

A small web app to view, create, and manage AI conversation sessions. Built with Next.js and TypeScript. Uses Google Gemini (free tier) for chat replies.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and add your Gemini API key. (`.env.local` is gitignored—never commit keys.)

```bash
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY=your_key
```

Get a free key at [Google AI Studio](https://aistudio.google.com/apikey). Without it, the app still runs and shows a mock response in chat.

## Deployment

The app is ready to deploy (e.g. [Vercel](https://vercel.com)). **Do not commit your API key.** Set it as an environment variable in your host:

- **Vercel:** Project → Settings → Environment Variables → add `GEMINI_API_KEY` with your key (enable for Production/Preview as needed).
- **Netlify:** Site settings → Environment variables → add `GEMINI_API_KEY`.
- **Other hosts:** Set `GEMINI_API_KEY` in the platform’s env/config so the server can read it at runtime.

Redeploy after adding the variable. The app uses `process.env.GEMINI_API_KEY` and will work once the variable is set.

**Storage:** In production, sessions and messages are stored in **Redis** (via the `redis` client), so they survive deploys and serverless restarts. In local dev without Redis configured, the app falls back to in-memory storage.

To enable persistent storage, create a Redis database (for example with Redis Cloud or Vercel Storage → Redis) and set this environment variable:

- `REDIS_URL` – e.g. `redis://default:password@host:port`

The storage layer automatically switches to Redis when `REDIS_URL` is set.

### Optional (for demo)

- **`NEXT_PUBLIC_MOCK_DELAY_MS`** – Simulate API delay in ms (e.g. `2000` for 2 seconds).
- **`NEXT_PUBLIC_MOCK_FAIL=true`** – Simulate API failure to test error handling.

## Features

- **Session list** – Create sessions, open one to chat, delete from the list (× on each card).
- **Session detail** – Send messages; assistant replies via Gemini. Loading and error states are handled.
- **Dark mode** – Toggle in the header.
- **Error monitoring** – Sentry-style simulation in `lib/error-handler.ts`; AI failures are captured and logged.

## Tech

- **Next.js 15** (App Router), **React 19**, **TypeScript**
- **Domain** – Types and repositories in `lib/domain/`; in-memory stores in `lib/storage/`.
- **Data** – Sessions and messages are stored in Redis in production (in-memory fallback in local dev).

## Scripts

| Command         | Description      |
| --------------- | ---------------- |
| `npm run dev`   | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production   |
| `npm run lint`  | Run ESLint       |
| `npm run test`  | Run Jest tests   |
