# Handoff: United Civil Group website

Current state only; history is `git log` and the tracker. Rewritten by `/checks`.

## Live
- https://unitedcivil.com.au (and `www.`) serves `main` as of `b6f4066` (19 Feb 2026), the multi-page site. Checked 2026-11-10: `capability-statement.html`, which only `main` has, loads live.
- The contact Worker at `contact.unitedcivil.com.au/send` is the old copy: its CORS replies name only `https://unitedcivil.com.au` (checked 2026-11-10 with a preflight from each origin), so enquiries sent from `www.` are blocked by the browser and lost. It sends to `info@unitedcivil.net.au`.

## In flight
- **Worker fixes, committed and waiting to be deployed:** `e82b84e` (accept posts from `www.`, a CORS header on every reply) and `6c4eb28` (send to `info@unitedcivil.com.au`, Ryan's answer 2026-11-10). Covered by `tests/worker.test.mjs`. Once deployed, probe the live Worker with a preflight from `https://www.unitedcivil.com.au`; it must answer with that origin.
- **Commits not yet pushed:** the two above plus the records commit (this file, `CLAUDE.md`, `README.md`, `tests/`, `.gitignore`). The next `/checks` pushes them; the site itself doesn't change.

## Waiting on the user
- **Access for agents.** Asked 2026-11-10 how the Worker gets updated, Ryan chose "Give agents access". Two steps, both typed in a VS Code terminal so no token passes through a Claude session:
  1. Cloudflare (UCG account) → Account API tokens → Create Token → template **Edit Cloudflare Workers**, scoped to the UCG account and the `unitedcivil.com.au` zone only. Save it as `CLOUDFLARE_API_TOKEN=…` in `~/.config/united/cloudflare.env`, then `chmod 600` that file. The account ID isn't secret: the agent looks it up with the token and puts it in `wrangler.toml`.
  2. DigitalOcean (the account holding `unitedcivilgroup`) → API → Generate New Token (read is enough to watch deploys), then `doctl auth init --context united` and paste it at the prompt.
- **Then the agent's part:** find the existing Worker's name through the API, add a `wrangler.toml` with that name, `main = "cloudflare-worker.js"` and the custom domain `contact.unitedcivil.com.au` (`custom_domain = true`), deploy with the env file loaded (`set -a; . ~/.config/united/cloudflare.env; set +a; npx wrangler deploy`; the Worker's existing secrets stay), probe it from both origins, and write the deploy command into `CLAUDE.md`.
- **Tracker setup:** `docs/agents/` doesn't exist yet, so `/continue` stops until the user types `/mattpocock-skills:setup-matt-pocock-skills`.

## Last sweep
None yet: the repo was first set up in this workspace on 2026-11-10, with no GitHub issues open.

## Next
`/mattpocock-skills:setup-matt-pocock-skills` (user-run), then `/continue`: once the access above exists, deploy the Worker with wrangler (the agent's part above) and confirm it answers `www.`. No issue is open; the queue is empty.
