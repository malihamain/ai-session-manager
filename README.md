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
- **Data** – Sessions and messages are stored in memory and are cleared when the dev server restarts.

## Scripts

| Command         | Description      |
| --------------- | ---------------- |
| `npm run dev`   | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production   |
| `npm run lint`  | Run ESLint       |
| `npm run test`  | Run Jest tests   |
