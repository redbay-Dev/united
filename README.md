# United Civil Group Website

Corporate website for United Civil Group - Civil Contracting Experts with over 30 years of experience in earthworks and civil construction across Australia.

## Live Site

- **Production:** https://unitedcivil.com.au
- **Digital Ocean:** https://unitedcivilgroup-h72xo.ondigitalocean.app

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Static HTML, CSS, JavaScript |
| Hosting | Digital Ocean App Platform |
| CDN/DNS | Cloudflare |
| Email | SMTP2GO (via Cloudflare Worker) |

## Project Structure

```
united/
├── index.html, about.html, services.html, contact.html,
│   capability-statement.html, 404.html   # Pages
├── services/               # One page per service
├── includes/
│   ├── header.html         # Shared header, injected by js/components.js
│   └── footer.html         # Shared footer, injected by js/components.js
├── css/
│   └── styles.css          # All styles (CSS variables, responsive)
├── js/
│   ├── components.js       # Loads the shared header and footer
│   └── main.js             # Navigation, animations, form handling
├── assets/                 # Logos, icons, photos, favicons
├── cloudflare-worker.js    # Contact form email handler (pasted into Cloudflare, not deployed by a push)
├── tests/                  # node --test tests/*.test.mjs
├── sitemap.xml, robots.txt
└── README.md
```

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#C36801` | Buttons, links, accents |
| Secondary | `#606060` | Supporting elements |
| Contrast | `#454545` | Dark text |
| Background | `#FFFFFF` | Page background |

## Configuration

### Digital Ocean App Platform

- **App Name:** unitedcivilgroup
- **Region:** SYD (Sydney)
- **Branch:** `main`
- **Auto-deploy:** Enabled (pushes to main trigger redeploy)

### Cloudflare DNS

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | `@` | `unitedcivilgroup-h72xo.ondigitalocean.app` | DNS only (grey) |
| CNAME | `*` | `unitedcivilgroup-h72xo.ondigitalocean.app` | DNS only (grey) |
| CNAME | `contact` | Worker route (auto-created) | Proxied (orange) |
| TXT | `@` | `v=spf1 include:spf.smtp2go.com ~all` | - |
| CAA | `@` | `0 issue "letsencrypt.org"` | - |
| CAA | `@` | `0 issue "pki.goog"` | - |

### Cloudflare Worker (Contact Form)

The contact form submits to a Cloudflare Worker that sends emails via SMTP2GO.

**Worker:** `ucg-contact` in the "Farrell Transport" Cloudflare account, on the custom domain `https://contact.unitedcivil.com.au/send`. Its settings are in `wrangler.toml`.

**Keys on the Worker** (never committed):

| Variable | Description |
|----------|-------------|
| `SMTP2GO_API_KEY` | SMTP2GO API key (send permission only) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |

They were set as plain-text variables in the dashboard; the first deploy through `scripts/deploy-worker.sh` turns them into encrypted secrets.

**Deploying:** a push to `main` does not deploy the Worker. With a Cloudflare API token ("Edit Cloudflare Workers" template) saved as `CLOUDFLARE_API_TOKEN=…` in `~/.config/united/cloudflare.env`, run `bash scripts/deploy-worker.sh` (or `--dry-run` first). `bash scripts/worker-logs.sh` summarises its last 7 days of logs. Tests: `node --test tests/*.test.mjs`.

### Cloudflare Turnstile (Bot Protection)

Turnstile provides invisible bot protection on the contact form.

**Dashboard:** Cloudflare → Turnstile → United Civil Group

| Key | Location |
|-----|----------|
| Site Key | `index.html` (in the Turnstile div) |
| Secret Key | Cloudflare Worker secret `TURNSTILE_SECRET_KEY` |

### SMTP2GO

- **Sender Domain:** unitedcivil.net.au (the mailbox is on .net.au, not the site's .com.au)
- **From Address:** info@unitedcivil.net.au
- **API Permissions:** Send Emails only

**Required DNS for email authentication** (on the sender domain, unitedcivil.net.au):

| Type | Name | Value |
|------|------|-------|
| TXT | `@` | `v=spf1 include:spf.smtp2go.com ~all` |
| CNAME | `em` | *(Get from SMTP2GO dashboard → Sender Domains)* |

## Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve

# PHP
php -S localhost:8000
```

Note: Contact form won't work locally (requires Cloudflare Worker).

## Deployment

Push to `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Digital Ocean will automatically rebuild and deploy.

## Contact Form Flow

```
User submits form
       ↓
JavaScript validates input
       ↓
POST to contact.unitedcivil.com.au/send
       ↓
Cloudflare Worker receives request
       ↓
Worker calls SMTP2GO API
       ↓
Email sent to info@unitedcivil.net.au
       ↓
Success response → User sees confirmation
```

## Pages/Sections

- **Home** - Hero with company intro
- **About** - Company background and team
- **Services** - Site remediation, subdivisions, infrastructure, earthworks
- **Equipment** - Fleet overview (excavators, dozers, graders, etc.)
- **Safety & Quality** - Safety, environmental, and QA commitments
- **Contact** - Contact details and enquiry form

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## License

Proprietary - United Civil Group © 2024
