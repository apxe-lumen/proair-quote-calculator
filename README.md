# ProAir Quote Calculator

A lead-capture room-sizing and quote estimator for [ProAir UK](https://proairuk.co.uk), a domestic air-conditioning installer. Customers add the rooms they'd like cooled, the tool sizes each room and suggests a unit capacity, and after the customer submits their contact details it reveals guide prices for three product tiers and emails the lead to the ProAir sales team.

## Tech stack

- **Next.js 14** (App Router) + **React 18**
- **Mailgun** (EU region) for transactional email
- **ntfy.sh** for push notifications to the ProAir team
- No database — leads are delivered straight to the sales inbox
- Plain CSS-in-JS (inline style objects); no Tailwind or component library

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Mailgun + ntfy credentials
npm run dev
```

Visit <http://localhost:3000>.

### Environment variables

| Name | Required | Purpose |
|------|----------|---------|
| `MAILGUN_API_KEY` | yes (prod), no (dev) | Mailgun Sending API key. In development the `/api/lead` route logs a warning and no-ops when this (or `MAILGUN_DOMAIN`) is unset, so the UX flow can be tested without sending real email. |
| `MAILGUN_DOMAIN` | yes (prod) | Verified sending domain (e.g. `proairuk.co.uk`). |
| `MAILGUN_REGION` | no | `eu` (default) or `us` — selects `api.eu.mailgun.net` vs `api.mailgun.net`. |
| `MAILGUN_FROM` | no | From-address override. Defaults to `no-reply@${MAILGUN_DOMAIN}`. |
| `PROAIR_EMAIL` | no | ProAir team inbox for lead notifications. Defaults to `contact@proairuk.co.uk`. |
| `NTFY_TOPIC` | no | ntfy.sh topic name for push notifications on completed quotes. Omit to disable. |
| `NTFY_TOKEN` | no | Bearer token for an authenticated/private ntfy topic. |

See `.env.example` for the full template.

## How the funnel works

The calculator is a three-step flow built as a single page:

1. **Rooms.** The customer adds one or more rooms with length, width, ceiling height, room type, glazing level, sun exposure, floor level and outdoor unit position. The sidebar shows live sizing (kW per room, total cooling load, suggested capacity). No pricing, no contact form.
2. **Contact details.** Once at least one room has length and width entered, the contact form appears inside the same card: name, phone, email, postcode, install timeframe. A GDPR consent notice sits above the submit button.
3. **Results.** On submit, the full quote is revealed: running-cost estimate, recommended systems for three brands (Midea Solstice, Mitsubishi Electric AY, Mitsubishi Electric Zen), guide prices, and a WhatsApp CTA.

### Lead capture

The tool sends leads to `contact@proairuk.co.uk` via Mailgun from the `/api/lead` route, and (if `NTFY_TOPIC` is set) fires an ntfy push to the ProAir team for completed quotes. Leads come in two flavours, differentiated by the `stage` field on the request body:

- **`stage: "completed"`** — the customer clicked submit. The email contains full contact details, sizing, room breakdown, selected system and guide prices for all three product tiers.
- **`stage: "partial"`** — the customer entered valid contact details and sized at least one room, but did not submit. Sent automatically after a short debounce, or via `navigator.sendBeacon` on tab close. The email contains contact details and sizing but **withholds guide prices**, because the customer has not seen them yet. Sales should follow up directly to complete the quote.

Each session can produce at most one email — a completed submit supersedes any pending partial send. A dedupe ref in the client (`leadStageRef`) enforces this.

## Project layout

```
app/
  layout.jsx            Minimal root layout
  page.jsx              The entire calculator UI & client-side logic
  api/lead/route.js     POST handler → sends lead email via Mailgun + ntfy push
public/                 Product imagery (Midea, Mitsubishi AY, Zen)
```

## Sizing model

Cooling load per room is calculated as `area × W/m² × factor / 1000`, rounded **up** to the next available unit size from the ladder `[2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1, 8.5, 10.0]` kW.

**Base watts per m²** by room type:

| Room type | W/m² |
|-----------|------|
| Bedroom | 110 |
| Living room | 125 |
| Office | 130 |
| Garden room | 135 |
| Kitchen | 150 |

**Uplift factors** (additive on a base of 1.0):

| Factor | Multiplier |
|--------|-----------|
| Glazing medium / high / very high | +0.10 / +0.22 / +0.35 |
| Exposure west / south | +0.08 / +0.14 |
| Ceiling height > 2.7 m / > 3.0 m | +0.08 / +0.08 (stacks) |

Pricing is hard-coded tier-based in `app/page.jsx` (`getUnitPrice`). The Mitsubishi Zen range is only offered when every sized room needs ≤ 5.0 kW.

## Production notes

- Lead emails send from `MAILGUN_FROM` (defaults to `no-reply@${MAILGUN_DOMAIN}`). Make sure the sending domain is verified in Mailgun (SPF/DKIM/DMARC) before going live.
- All interpolated customer input in the lead email is HTML-escaped to prevent injection in the sales inbox.
- The tool collects personal data (name, phone, email, postcode) and automatically sends a "partial lead" email on abandonment. A visible consent notice is shown above the submit button — ProAir's privacy policy should cover the "we may follow up if you don't complete the form" case before going live.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Next dev server on :3000 |
| `npm run build` | Production build |
