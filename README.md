# Modern Product Slider — React SaaS & Vercel License API

Deploy this project to GitHub and Vercel to test **Modern Product Slider Pro** license activation (`$3/mo` Single Site and `$10/mo` Unlimited Sites).

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. Import the repository into [Vercel](https://vercel.com) (Framework Preset: **Vite**).
3. Click **Deploy**. Vercel automatically deploys both the React frontend and the `/api/v1/license/verify` + `/api/v1/license/deactivate` serverless endpoints.

## Connect Your WordPress Pro Plugin
Add this one-line filter to your WordPress site's `functions.php` (or a small snippet plugin) pointing to your Vercel URL:

```php
add_filter( 'mpc_pro_api_endpoint', function() {
    return 'https://YOUR-PROJECT.vercel.app/api/v1/license/verify';
} );
```

## Pre-Seeded Test Keys
- Single Site (`$3/mo`, max 1 domain): `mps_test_single_3usd`
- Unlimited Sites (`$10/mo`, unlimited domains): `mps_test_unlimited_10usd`
- Or sign up on the React site to generate a new `mps_live_s1_...` or `mps_live_un_...` key.
