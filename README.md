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
├── index.html              # Main HTML page
├── css/
│   └── styles.css          # All styles (CSS variables, responsive)
├── js/
│   └── main.js             # Navigation, animations, form handling
├── assets/
│   └── favicon.svg         # Site favicon
├── cloudflare-worker.js    # Contact form email handler (deploy to CF)
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

**Worker URL:** `https://contact.unitedcivil.com.au/send`

**Environment Variables:**

| Variable | Type | Description |
|----------|------|-------------|
| `SMTP2GO_API_KEY` | Secret | SMTP2GO API key (send permission only) |

**Setup Steps:**

1. Create Worker in Cloudflare dashboard (Workers & Pages → Create)
2. Paste contents of `cloudflare-worker.js`
3. Add `SMTP2GO_API_KEY` secret in Settings → Variables
4. Add custom domain `contact.unitedcivil.com.au` in Settings → Domains

### SMTP2GO

- **Sender Domain:** unitedcivil.com.au
- **From Address:** info@unitedcivil.com.au
- **API Permissions:** Send Emails only

**Required DNS for email authentication:**

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
Email sent to info@unitedcivil.com.au
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
