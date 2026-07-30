# Stephen-Ai-Projects

This repository hosts **three independent products, each on its own branch**. The
`main` branch intentionally contains only this file and `README.md`; there is no
shared code between products. To work on a product, check out its branch.

| Branch | Product | Stack | Location |
| --- | --- | --- | --- |
| `cursor/email-bot-starter-21f6` | Rule-based IMAP/SMTP email auto-reply bot (CLI) | Python 3 (stdlib only) | repo root |
| `cursor/email-dashboard-hub-b6ab` | Static email-management dashboard (mock data) | HTML/CSS/vanilla JS | repo root |
| `cursor/nextjs-sheet-dashboard-1c7c` | Google Sheets inbox dashboard | Next.js 16 / React 19 / TS | `next-dashboard/` |

## Per-product commands

**Email bot** (`cursor/email-bot-starter-21f6`) — no dependencies to install.
- Test: `python3 -m unittest discover -s tests -v`
- Run: `python3 main.py --once` (requires `IMAP_HOST`, `SMTP_HOST`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`; see `.env.example` / `README.md`)

**Static dashboard** (`cursor/email-dashboard-hub-b6ab`) — no dependencies, no build.
- Run: `python3 -m http.server 8080` then open `http://localhost:8080`

**Next.js dashboard** (`cursor/nextjs-sheet-dashboard-1c7c`) — run all commands inside `next-dashboard/`.
- Install: `npm install`
- Lint: `npm run lint` · Build: `npm run build` · Dev: `npm run dev` (port 3000)
- Env: create `next-dashboard/.env.local`; see `next-dashboard/README.md`.

## Cursor Cloud specific instructions

- The startup/update script only runs `npm install` in `next-dashboard/` when
  `next-dashboard/package.json` is present, so it is a no-op on `main` and on the
  two dependency-free branches. Nothing else needs installing (Python 3 and Node
  are preinstalled; the email bot and static hub have zero third-party deps).
- **Email bot**: `process_cycle()` opens live IMAP+SMTP connections even in
  `DRY_RUN` mode (dry-run only skips *sending*), so running `main.py` without
  reachable servers will error at connect time. To validate logic offline, use the
  unit tests or exercise `email_bot.rules` / `email_bot.state` directly.
- **Next.js `/api/messages`** throws (HTTP 500) unless real Google service-account
  credentials + a spreadsheet are configured — it is expected to show
  "Missing required environment variable: GOOGLE_SERVICE_ACCOUNT_EMAIL" until then.
  The UI shell still renders; only that route needs creds.
- **Next.js `/api/profile`** proxies to `WEBHOOK_URL`. For local end-to-end
  testing you can point `WEBHOOK_URL` at any local JSON echo endpoint instead of a
  real service.
- Next.js 16 has breaking changes vs. older training data; consult
  `next-dashboard/node_modules/next/dist/docs/` before editing that app (see
  `next-dashboard/AGENTS.md`).
