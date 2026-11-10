# United Civil Group website

United Civil Group's public site, https://unitedcivil.com.au: plain HTML, CSS and JavaScript, with no build step and no `package.json`. `README.md` holds the DNS records, the SMTP2GO setup and the brand colours; this file holds what an agent needs on top of it. The way of working is the global `~/.claude/CLAUDE.md`'s.

## How it ships
- **The site:** a push to `main` is the deploy. DigitalOcean App Platform (app `unitedcivilgroup`, region SYD, `unitedcivilgroup-h72xo.ondigitalocean.app`) rebuilds from `main` on its own. Its DigitalOcean account is in none of this workspace's `doctl` logins (`doctl auth list`), so check a deploy by loading the live page.
- **The contact form's Worker is not deployed by a push.** `cloudflare-worker.js` runs as the `ucg-contact` Worker on `https://contact.unitedcivil.com.au/send`, in the "Farrell Transport" Cloudflare account; `wrangler.toml` holds its settings, matched to what was live on 2026-11-10. Deploy it with `bash scripts/deploy-worker.sh` (add `--dry-run` to check first), then probe it live with a CORS preflight from each origin (`curl -X OPTIONS -H "Origin: …"`). It sends from and to `info@unitedcivil.net.au`: the mailbox and the SMTP2GO sender are on `.net.au`, not the site's `.com.au` (Ryan, 2026-11-10).
- **Credentials:** a Cloudflare token ("Edit Cloudflare Workers" template, one account) sits in `~/.config/united/cloudflare.env`. The secret guard blocks any command that names that file, so reach Cloudflare through `scripts/deploy-worker.sh` and `scripts/worker-logs.sh`, which load it without printing it. The Worker's `SMTP2GO_API_KEY` and `TURNSTILE_SECRET_KEY` are never printed either.
- The site answers on both `unitedcivil.com.au` and `www.unitedcivil.com.au`, with no redirect between them, so anything keyed to the origin (the Worker's `ALLOWED_ORIGINS`, the Turnstile widget's hostnames) covers both.

## How the pages are built
- Pages: `index.html`, `about.html`, `services.html`, `services/*.html`, `contact.html`, `capability-statement.html`, `404.html`. A new page also goes in `sitemap.xml`, with canonical and Open Graph tags like its neighbours'.
- The header and footer exist once, in `includes/header.html` and `includes/footer.html`. `js/components.js` fetches them into `#site-header` and `#site-footer`, replacing `{{BASE}}` with `.` or `..` (for pages under `services/`). So a page works only when served over HTTP: opened as a file, its header, footer and Turnstile widget all fail. Turnstile also refuses `localhost`, since it runs only on the site's own hostnames; that error is expected locally.
- Pages load `css/styles.css?v=N`, `js/main.js?v=N` and `js/components.js?v=N`. When one of those files changes, bump its `N` on every page, or returning visitors keep the cached old copy.
- Google Analytics (`G-WVD172NNF1`) is in each page's head; a sent enquiry fires a `generate_lead` event.

## Session
- **Tracker:** GitHub issues on `redbay-Dev/united`, as `docs/agents/issue-tracker.md` says.
- **Checks:** `node --test tests/*.test.mjs` (the Worker, with Turnstile and SMTP2GO stubbed). There is no `package.json`, so `/checks` reports type-check and lint as missing.
- **Screen check:** serve the repo root (`npx serve -l 5180 .`; 5180 is free in `~/projects/Docs/remote_enviroment.md`'s port table) and open each changed page in Chrome through the Playwright or Chrome DevTools MCP, at 390 px and 1280 px wide: the header and footer load, nothing overflows, and the console shows no error from the site's own files. Errors from `challenges.cloudflare.com` are Turnstile's own frame probing the browser (and timing out, as a headless browser never passes), not the site's.
- **Sweep:** the open GitHub issues, and the Worker's logs: `bash scripts/worker-logs.sh 7` (requests by method, status and origin, then each error line; Cloudflare keeps about 7 days). A failed real enquiry (a POST to `/send` from either site origin with a 4xx or 5xx) is live breakage; a scanner hitting other paths is not. The site has no support tickets or background workers.
- **Release:** the push `/checks` makes is the release, live within minutes, so a fixed issue closes as "live". A Worker change is live only after `scripts/deploy-worker.sh` runs, which happens only when the user says go.
- **Commits:** conventional, scoped by area: `fix(contact): …`, `feat(pages): …`, `docs: …`.
- **No partner repo:** no other repo's window shares this work; this repo is worked alone.
