# 🗄️ Modern Product Slider — Database Connection & Setup Guide

This guide provides step-by-step instructions for connecting a production database to the **Modern Product Slider Pro** license & SaaS platform.

---

## ⚡ Architecture Overview

The system is designed with a **flexible multi-engine database layer**:

| Mode | Engine | Best For | Status |
| :--- | :--- | :--- | :--- |
| **Local / Dev** | `data/saas_db.json` + RAM | Immediate testing without any database setup | ✅ Zero-config ready |
| **Production (Recommended)** | **Supabase (PostgreSQL)** | Free 500MB cloud database with full SQL editor | 🚀 Recommended |
| **Production Serverless** | **Neon Postgres** | 1-click Vercel integration & autoscaling | ⚡ Excellent |
| **Document NoSQL** | **MongoDB Atlas** | Fast JSON document store | 📦 Supported |
| **Ultra-Low Latency KV** | **Upstash Redis / Vercel KV** | In-memory key-value licensing lookup | 🏎️ Supported |

---

## 🚀 Option 1: Supabase (Recommended Free PostgreSQL)

Supabase provides a generous free tier (500MB storage, unlimited API requests) with an interactive SQL web console.

### Step 1: Create a Free Project
1. Go to **[supabase.com](https://supabase.com)** and sign in with GitHub.
2. Click **New Project**, choose an organization, and give your project a name (e.g. `modern-product-slider`).
3. Set a strong database password (remember this password).
4. Select your preferred region (e.g. `US East`, `EU West`, `Central India`).

### Step 2: Run the SQL Schema
1. In the Supabase left sidebar, click **SQL Editor** (icon: `>_`).
2. Click **New query**.
3. Open [`schema.sql`](file:///Users/macbookpro/Downloads/modern-product-slider-saas-2/schema.sql) in this repository, copy all the SQL code, and paste it into the query editor.
4. Click **Run** (green button).
5. All 5 tables (`users`, `active_domains`, `otps`, `transactions`, `audit_logs`) and indexes are created instantly.

### Step 3: Copy Connection String
1. In the left sidebar, navigate to **Project Settings** (gear icon) → **Database**.
2. Scroll to the **Connection string** section.
3. Select the **URI** tab and choose **Session pooler** (port `5432`) or **Transaction pooler** (port `6543`).
4. Copy the connection string. Replace `[YOUR-PASSWORD]` with the password you set in Step 1.
   ```text
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
   ```

### Step 4: Add to `.env` and Vercel
Add the variable to your local `.env`:
```bash
DATABASE_URL="postgresql://postgres.xxxx:yourpassword@aws-0-xxxx.pooler.supabase.com:6543/postgres?sslmode=require"
```
And in your **Vercel Dashboard** under **Project Settings → Environment Variables**, add `DATABASE_URL`.

---

## ⚡ Option 2: Neon Serverless Postgres (1-Click Vercel Integration)

If you are hosting on Vercel:

1. Open your Vercel Project Dashboard.
2. Click the **Storage** tab → **Create Database** → Select **Postgres (Neon)**.
3. Click **Connect to Project**.
4. Vercel will automatically inject:
   - `POSTGRES_URL`
   - `DATABASE_URL`
5. Click **Open in Neon Console**, open the **SQL Editor**, and run the SQL code from [`schema.sql`](file:///Users/macbookpro/Downloads/modern-product-slider-saas-2/schema.sql).

---

## 🍃 Option 3: MongoDB Atlas

If you prefer MongoDB:
1. Create a free cluster at **[mongodb.com/atlas](https://www.mongodb.com/atlas)**.
2. In **Database Access**, create a user with read/write permissions.
3. In **Network Access**, add IP `0.0.0.0/0` (Allow from anywhere) to allow Vercel serverless connections.
4. Click **Connect** → **Drivers** → Copy connection URI:
   ```bash
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/modern_slider?retryWrites=true&w=majority"
   ```
5. Add `MONGODB_URI` to your `.env` or Vercel variables.

---

## 🏎️ Option 4: Vercel KV / Upstash Redis

For sub-millisecond license key verification:
1. Go to **[upstash.com](https://upstash.com)** or the Vercel Storage tab.
2. Create a Redis database.
3. Copy:
   ```bash
   UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="xxxx"
   ```

---

## 🔒 Environment Variables Reference

Here is the complete reference of all configuration keys (`.env`):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL / Supabase connection URI | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `ADMIN_EMAIL` | Super Admin email address | `admin@modernproductslider.com` |
| `ADMIN_SECRET` | Super Admin security header token for RBAC | `mps_superadmin_secret_2026` |
| `RESEND_API_KEY` | Resend API key for real Gmail OTP delivery | `re_123456789...` |
| `SMTP_FROM` | Sender address for transactional emails | `Modern Slider <onboarding@yourdomain.com>` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | `xxxx.apps.googleusercontent.com` |

---

## 🛡️ Production Security Checklist

- [x] **Rate Limiting**: Integrated sliding-window rate limit (max 5 OTPs/10min, max 120 license verifications/min).
- [x] **Timing-Attack Resistance**: Using `crypto.timingSafeEqual` with SHA-256 for all key and code validations.
- [x] **SSL Mode Required**: Ensure `?sslmode=require` is appended to all PostgreSQL URLs.
- [x] **Security Headers**: HSTS, CSP, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`).
- [x] **Input Sanitization**: Domains and emails are normalized and strictly validated before database storage.
