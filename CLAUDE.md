# CLAUDE.md — Project Rules for SentenceBuilder

## Workflow Rules
- After completing a major feature or implementation milestone, commit and push to GitHub automatically.

## Project Overview
- Multilingual sentence construction game for early readers (ages 4-8)
- Supports English, French, and Simplified Chinese
- Tech stack: Vite 8, React 19, TypeScript ~5.9, Tailwind CSS v4, Zustand, @dnd-kit

## Build & Dev Commands
- `npm run dev` — start dev server (port 5173)
- `npm run build` — production build (runs tsc then vite build)
- `npx tsc -b --noEmit` — type check only

## Git Config
- Remote: https://github.com/tachou/SentenceBuilder.git
- Branch: main
- User: tachou <tachou@gmail.com>
- Windows PATH note: prefix commands with `PATH="/c/Program Files/nodejs:$PATH"` and `PATH="/c/Program Files/GitHub CLI:$PATH"` as needed
