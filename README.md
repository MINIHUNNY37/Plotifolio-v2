# Finance Scenario Builder

Interactive finance modeling UI built with React, TypeScript, Vite, Tailwind CSS, Zustand, and `@xyflow/react`.

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## App Structure

- `src/components/views` contains the main screens: builder, library, comparison, and settings.
- `src/store` holds shared scenario state.
- `src/components/canvas` and `src/components/nodes` contain the scenario graph experience.
- `src/data` contains starter demo scenarios, templates, and catalog data.

## Codex Migration

This repo now includes project-level Codex guidance so future sessions can follow a Claude-like workflow:

- `AGENTS.md` contains the default project instructions for Codex.
- `docs/codex-setup.md` explains the tool mapping, git workflow, and Vercel notes for this Vite app.

## Deployment Note

If you connect this repo to Vercel, the expected build for this project is `npm run build`.
