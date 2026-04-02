# Codex Setup For This Project

This project can use the same mental model you already use with Claude Code: Codex is another coding agent with filesystem and shell access. The main difference is the tool names and a few workflow conventions.

## Tool Mapping

| Claude Code | Codex in this workspace | Notes |
| --- | --- | --- |
| `Read` | file reads via shell commands like `Get-Content` | Used to inspect files before editing |
| `Edit` | `apply_patch` | Best for exact, reviewable edits |
| `Write` | `apply_patch` add/replace file content | Used for new files and full rewrites |
| `Grep` | `rg` | Fast codebase search |
| `Glob` | `rg --files` or `Get-ChildItem` | File discovery |
| `Bash` | `shell_command` | Runs PowerShell commands in this workspace |

## Recommended Codex Workflow

1. Open the project root in Codex.
2. Ask Codex to inspect the relevant files before changing anything.
3. Let Codex make edits with `apply_patch`, then run validation with:
   - `npm run lint`
   - `npm run build`
4. If the folder is connected to Git, keep the same safe branch workflow:
   - create a feature branch like `codex/fix-scenario-panel`
   - stage only the files you mean to commit
   - commit with a clear subject and optional body
   - push the feature branch and let Vercel create a preview deployment if the repo is connected

## Git Notes

- This specific workspace does not currently contain a `.git` directory, so Codex cannot branch, commit, or push from here yet.
- If this is meant to stay connected to an existing GitHub repo, clone that repo or reconnect this folder before expecting the full Claude-style git flow.
- If this is a fresh local project, initialize Git first and then add the remote:

```powershell
git init -b main
git remote add origin <your-github-repo-url>
git checkout -b codex/initial-setup
```

## Vercel Notes For This Repo

- Your earlier Claude description used Next.js as the example build step. This repo is a Vite app, so Vercel should run `npm run build` and serve the generated static output.
- The overall deployment model is still the same:
  - Codex edits local files
  - Git pushes a branch
  - GitHub notifies Vercel
  - Vercel builds the branch and creates a preview or production deployment depending on your branch rules

## What Codex Can And Cannot Do

Codex can:
- inspect and edit files in the workspace
- run local build and lint commands
- prepare git commands and, once the repo is connected, run standard git workflows

Codex cannot:
- see Vercel dashboard data unless you paste it in or connect a tool that exposes it
- verify production runtime behavior directly from the deployed site without separate access
- safely guess your Git remote if this folder is not already connected

## Repo Conventions Added Here

This repo now includes:
- `AGENTS.md` for project-specific Codex behavior
- safer `.gitignore` coverage for `.env*`, `.vercel`, and TypeScript build info
- a project README that points future sessions at the Codex workflow
