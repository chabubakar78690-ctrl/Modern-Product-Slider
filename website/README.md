# Modern Product Slider — Website (Next.js)

Landing page for the **Modern Product Slider** WordPress plugin, in the
style of the Elementor pricing / product page Abubakar shared as a reference,
but with content, pricing and branding for this plugin only.

## What is here

- `website/` — Next.js 14 (App Router) landing page. No database, no login
  yet. Login / signup, Pro checkout and the Pro ZIP download are the next
  step, after this landing page.
- The existing Vite + Express SaaS portal at the repo root is untouched.
  This Next.js site lives in `website/` so both can live in one repo for now.
  If you prefer a separate repo for the website, say so and I will move it.

## Pricing (as shared)

| Plan | Price | For |
| --- | --- | --- |
| Free | $0 | WordPress.org, limited sliders |
| Single Site | $3 / month | 1 WordPress site, unlimited sliders, unlimited products per rack, instant Pro Add-On ZIP download |
| Unlimited Sites | $10 / month — Best Value | Unlimited sites, everything in Single, priority developer support |

## Run it locally

```bash
cd website
npm install
npm run dev
# open http://localhost:3000
```

## Deploy

Vercel is the simplest fit for Next.js:

1. Import `chabubakar78690-ctrl/Modern-Product-Slider` in Vercel.
2. Set **Root Directory** to `website`.
3. Deploy. No environment variables are needed for the landing page alone.

## Notes / placeholders to replace before launch

- Testimonials in `src/app/page.jsx` are placeholders — replace them with
  real store-owner quotes.
- “Download Free” currently links to `#pricing`. Point it at the real
  WordPress.org plugin URL once the free version is live there.
- “Get Pro” buttons currently link to `#pricing`. They will link to the
  checkout / login flow in the next step.
- The logo in the header uses `public/logo.svg` (a clean recreation of the
  shared logo). The original PNG is kept in the user's media library, not
  in this repo — binary files are not pushed by the snapshot push used
  here, so upload it via the GitHub web UI if you want the exact PNG on
  the site, or keep the SVG.
- Product photos in the live demo are Unsplash demo images. Replace them
  with real WooCommerce product shots when you have them.
