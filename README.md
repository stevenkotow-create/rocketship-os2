# RocketShip OS 🚀

> An AI-native job-search operating system. Open skeleton, no data. Bring your own search.

RocketShip OS is a Next.js 14 app for running a job search like a sales pipeline: track opportunities, multi-thread stakeholders, prep interviews, score companies, and keep a decision log. This repository ships the **engine only** with no personal data. You populate it as you go, and everything you enter stays in your own browser.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app loads empty, ready for you to add your first opportunity.

## Where your data lives

All state is stored in your browser's `localStorage` under a single key. Nothing is sent to a server, and nothing is shared between users. If you deploy this and send someone the link, they get their own private copy automatically.

## Project structure

```
app/            → routes, one folder per module (pipeline, probes, evaluator, coach, etc.)
components/     → shared UI (Sidebar, cards, Solar System, dashboard)
lib/
  data/         → seed data files, all shipped EMPTY for you to fill
  types.ts      → the data model
  storage.ts    → localStorage read/write (swap this for a backend later)
  *.ts          → engine logic (ranker, star-map, mission-compass, etc.)
```

## Modules

Mission Control, Pipeline, Probes Inbox, Company Evaluator, Star Map / Threads, Interview Prep, Comms Bay, Frameworks Manual, Comp Benchmarks, Resilience, Decision Journal, and a Mission Log. Every module renders on empty data and fills in as you use it.

## The AI features (optional)

The Evaluator and Coach can call the Anthropic API. They're off until you add a key. Copy `.env.local.example` to `.env.local` and set `ANTHROPIC_API_KEY`. Without a key, everything else works and the AI surfaces fall back to manual input.

## Contributing

This is a community skeleton. Improvements to the engine, modules, and UX are welcome. See `CONTRIBUTING.md`.

## License

MIT. See `LICENSE`.
