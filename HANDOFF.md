# Handoff: United Civil Group website

Current state only; history is `git log` and the tracker. Rewritten by `/checks`.

## Live
- https://unitedcivil.com.au (and `www.`) serves `main` as of `b6f4066` (19 Feb 2026), the multi-page site. Checked 2026-11-10: `capability-statement.html`, which only `main` has, loads live.
- The contact Worker at `contact.unitedcivil.com.au/send` is the old copy: its CORS replies name only `https://unitedcivil.com.au` (checked 2026-11-10 with a preflight from each origin), so enquiries sent from `www.` are blocked by the browser and lost. It sends to `info@unitedcivil.net.au`.

## In flight
- **Worker fixes, committed and waiting to be pasted into Cloudflare by the user:** `e82b84e` (accept posts from `www.`, a CORS header on every reply) and `6c4eb28` (send to `info@unitedcivil.com.au`, Ryan's answer 2026-11-10). Covered by `tests/worker.test.mjs`. Once pasted, probe the live Worker with a preflight from `https://www.unitedcivil.com.au`; it must answer with that origin.
- **Commits not yet pushed:** the two above plus the records commit (this file, `CLAUDE.md`, `README.md`, `tests/`, `.gitignore`). The next `/checks` pushes them; the site itself doesn't change.

## Waiting on the user
- **Paste `cloudflare-worker.js` into the Cloudflare dashboard** (Workers & Pages → the contact Worker → Edit code). Only the user can reach that account.
- **Access, asked 2026-11-10 and not yet answered:** whether agents get a `doctl` context and a Cloudflare token for the UCG accounts (so they can watch deploys and deploy the Worker with wrangler), or the user keeps pasting the Worker by hand.
- **Tracker setup:** `docs/agents/` doesn't exist yet, so `/continue` stops until the user types `/mattpocock-skills:setup-matt-pocock-skills`.

## Last sweep
None yet: the repo was first set up in this workspace on 2026-11-10, with no GitHub issues open.

## Next
`/mattpocock-skills:setup-matt-pocock-skills` (user-run), then `/continue`: confirm the pasted Worker answers `www.` (the preflight above). No issue is open; the queue is empty.
