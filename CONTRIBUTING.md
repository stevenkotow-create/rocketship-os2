# Contributing to RocketShip OS

Thanks for helping build this. A few ground rules keep it clean and safe for everyone.

## The one hard rule: no personal data in the repo

This is a shared skeleton. Never commit real personal data: your own or anyone else's. That means no real names, no LinkedIn URLs, no interview notes, no private intel about people or companies, no comp figures tied to a real person. Your live search data belongs in your browser (localStorage) or your own private deployment, never in a commit.

Seed data files under `lib/data/` ship empty on purpose. If you add example data to demonstrate a feature, make it obviously fictional (`Example Corp`, `Jane Doe`).

## Workflow

1. Create a branch off `main`: `git checkout -b your-feature`.
2. Make your change. Keep it focused.
3. Confirm it builds: `npm run build`.
4. Push your branch and open a pull request.
5. A maintainer reviews and merges.

If you have write access and the change is small and safe, you can push to `main`, but a branch plus PR is preferred so changes are reviewed and every push gets its own Vercel preview URL to test against.

## What's welcome

Engine improvements, new modules, better UX, bug fixes, accessibility, docs. If you're unsure whether something fits, open an issue first and ask.

## Style

Match the existing TypeScript and component patterns. Keep the dark-theme aesthetic. Don't add dependencies without discussion.
