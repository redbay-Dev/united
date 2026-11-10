# Handoff: United Civil Group website

Current state only; history is `git log` and the tracker. Rewritten by `/checks`.

## Live
- **The site** (https://unitedcivil.com.au and `www.`, no redirect between them) serves `main` through DigitalOcean. The `/checks` of 2026-11-10 that wrote this file pushed `main`, which adds Wayne & Christine's review (The Mouses Rainforest Retreat & Lodge) to the homepage, puts `info@unitedcivil.net.au` in the homepage's schema data, and loads `styles.css?v=6`. Confirm that deploy went live: `doctl apps list-deployments 6ec59940-2b8d-4506-adcf-52ae7ef1508a --context united`, then the homepage's "Client Testimonial" section.
- **The contact Worker** `ucg-contact` is still the copy last edited in the Cloudflare dashboard (2025-12-04), without the fixes in #1: enquiries from `www.` are blocked by the browser, and its two keys are plain-text vars. It sends to and from `info@unitedcivil.net.au`, and that works: an enquiry from the apex went through on 2026-11-10 at 02:38 UTC.

## In flight
- **#1, deploy the Worker fixes.** Built, 8 tests green, `bash scripts/deploy-worker.sh --dry-run` passes. The deploy is Severe (enquiry email) and waits on Ryan's go; his answer on 2026-11-10 was "not yet". The issue holds what changes, the risk (the Turnstile check starts being enforced) and the check afterwards.

## Waiting on the user
- **#1:** the go to deploy, then one test enquiry from https://unitedcivil.com.au/contact.html and one from https://www.unitedcivil.com.au/contact.html.
- **Tracker setup:** `docs/agents/` doesn't exist, so `/continue` stops until Ryan types `/mattpocock-skills:setup-matt-pocock-skills`. #1 has no label yet; it is a `needs-info` question.

## Last sweep
2026-11-10 04:48 UTC. GitHub issues: none open before #1. Worker logs, last 7 days (`bash scripts/worker-logs.sh 7`): a scanner on 6–7 Nov probing made-up paths, each logged as a 500 (the deploy in #1 turns those into 404s); one real enquiry, delivered; no failed real enquiry.

## Next
After the tracker setup, `/continue`. On Ryan's go for #1: `bash scripts/deploy-worker.sh`, check it printed both keys as `secret_text`, ask Ryan for the two test enquiries, confirm both as `POST 200` in `bash scripts/worker-logs.sh 1`, then close #1 as live. If an enquiry fails, roll back (steps in #1) and work it through `mattpocock-skills:diagnosing-bugs`.
