# Backend setup — Modern Product Slider SaaS

The backend is Next.js API routes (7 serverless functions, under Vercel
Hobby's limit of 12). It works in **demo mode** with no setup at all, and
switches to the real database automatically once Supabase is connected.

## What the backend does

| Route | Purpose |
| --- | --- |
| `POST /api/auth/signup` · `POST /api/auth/login` | Email + password accounts (scrypt hashing, HMAC-signed httpOnly session cookie) |
| `GET /api/auth/me` · `POST /api/auth/logout` | Current session / sign out |
| `GET /api/auth/google` · `GET /api/auth/google/callback` | Google sign-in (needs keys, see below) |
| `GET /api/auth/facebook` · `GET /api/auth/facebook/callback` | Facebook sign-in (needs keys) |
| `GET /api/licenses` · `POST /api/licenses` | List / create license keys (signed in) |
| `POST /api/license/verify` · `POST /api/license/deactivate` | Public API the WordPress plugin calls |
| `POST /api/payfast/checkout` | Signed PayFast checkout form (signature built server-side) |
| `POST /api/payfast/itn` | PayFast ITN webhook — 4 security checks, then activates the license |
| `GET /api/download?key=…&domain=…` | License-gated Pro ZIP download |
| `GET /api/admin/overview|users|payments|pricing|settings` | Admin data (admin session only) |
| `PUT /api/admin/pricing` · `PUT /api/admin/settings` | Save pricing / OAuth + PayFast keys |
| `GET /api/plugin` | Public latest-version info for the WordPress update checker |

## Step 1 — Supabase (free) for the real database

1. Go to https://supabase.com → create a free project.
2. In the project, open **SQL Editor**, paste `supabase/schema.sql` (in this
   repo) and Run it.
3. In **Project Settings → API**, copy the **Project URL** and the
   **service_role** key (secret — server only, never in the browser).

Without this step the API runs in demo mode: data is seeded in memory,
resets between server restarts, and is not shared between users.

## Step 2 — Environment variables (Vercel)

Vercel Dashboard → Project → Settings → Environment Variables → add:

- `SUPABASE_URL` — from step 1
- `SUPABASE_SERVICE_ROLE_KEY` — from step 1
- `SESSION_SECRET` — any long random string
- `ADMIN_EMAIL` — `chabubakar78690@gmail.com` (first signup with this
  email becomes the admin)
- `NEXT_PUBLIC_SITE_URL` — `https://modern-product-slider.vercel.app`

Then redeploy (Deployments → ⋯ → Redeploy).

## Step 3 — Google / Facebook login (optional)

- **Google:** Google Cloud Console → create OAuth client (Web) →
  Authorized redirect URI:
  `https://modern-product-slider.vercel.app/api/auth/google/callback`
  Put the Client ID + Secret in Admin → Settings → Social login
  (or the `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars).
- **Facebook:** Meta Developers → Facebook Login → redirect URI:
  `https://modern-product-slider.vercel.app/api/auth/facebook/callback`
  Same place for the App ID + Secret.

Apple sign-in needs an Apple Developer Services ID + key — not built yet.

## Step 4 — PayFast (sandbox first, live later)

Sandbox already works with the test credentials
(Merchant ID `10000100`, key `46f0cd694581a`) — no account needed.
Try it: Dashboard → Billing → upgrade a plan → Confirm sandbox payment.

For **live** payments: create a PayFast merchant account, then in
Admin → Settings → PayFast turn **Sandbox OFF** and enter your live
Merchant ID, Merchant Key and Passphrase (must match
PayFast → Settings → Security). Note: PayFast is a South African
gateway — a live merchant account needs South African business/bank
details. The ITN notify URL is
`https://modern-product-slider.vercel.app/api/payfast/itn`.

## Step 5 — Pro ZIP uploads

Admin → Downloads → upload a version. The file itself must also exist in
`public/downloads/` in the repo (e.g.
`public/downloads/modern-product-slider-pro-2.1.0.zip`) — that is what
`/api/download` serves after checking the license.
