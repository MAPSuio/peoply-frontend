# Peoply frontend

## PR-krav

- Alle PR-er med synlige UI-endringer skal ha før/etter-screenshots i
  PR-beskrivelsen: fullside i 390×844 (mobil) og 1440×900 (desktop) per berørt
  side. Følg skillen `frontend-pr-screenshots`
  (`.claude/skills/frontend-pr-screenshots/SKILL.md`). PR-er uten visuell
  effekt skal si «Ingen visuelle endringer.» i beskrivelsen.
- UI-et designes mobile-first — verifiser alltid ved 390px før desktop.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
