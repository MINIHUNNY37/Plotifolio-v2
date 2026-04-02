# AGENTS.md

## Project Context
- This project is a finance scenario builder UI built with React 19, TypeScript, Vite, Tailwind CSS, Zustand, and `@xyflow/react`.
- The main user-facing views live in `src/components/views` and switch from `src/App.tsx`.
- The project is currently a frontend-only Vite app. There is no backend or environment-variable usage in `src` today.

## Working Style
- Start by inspecting the affected files and any nearby store, utility, or view components before editing.
- Prefer `rg` and `rg --files` for search.
- Keep edits surgical when possible and preserve the existing visual language.
- Treat unexpected local changes as user work unless proven otherwise. Do not revert them without permission.

## Validation
- After meaningful code changes, run `npm run lint`.
- After meaningful UI or state changes, also run `npm run build`.

## Git Workflow
- If this folder is attached to Git, use feature branches with the `codex/` prefix instead of working on `main`.
- Stage explicit files instead of broad adds like `git add .` unless the user explicitly wants everything staged.
- Keep secrets and generated files out of commits. `.env*`, `.vercel`, `dist`, and other local artifacts should stay untracked.
- Write commit messages that explain the user-visible change first. Add a short body when validation or deployment context matters.

## Deployment Notes
- If this project is connected to Vercel, the expected build for this repo is `npm run build` for a Vite static app, not `next build`.
- Non-production branches are suitable for preview deployments. Production should still be a deliberate merge or push chosen by the user.
- Codex can prepare code, validation, and git commands, but deployment logs still need to be checked in Vercel.
