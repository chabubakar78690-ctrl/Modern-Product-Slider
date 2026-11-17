-- Modern Product Slider — Supabase schema (free tier is enough to start).
-- In Supabase: SQL Editor -> paste this whole file -> Run.
-- Then copy the Project URL + service_role key into Vercel env vars:
--   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
-- (Use the service_role key ONLY on the server — never in the browser.)

create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password_hash text not null default '',
  role text not null default 'customer',
  provider text not null default 'email',
  created_at date not null default current_date
);

create table if not exists licenses (
  id text primary key,
  key text unique not null,
  user_email text not null default '',
  plan text not null,
  domain text not null,
  status text not null default 'Active',
  version text not null default '2.1.0',
  created_at date not null default current_date,
  last_check text not null default '—'
);

create table if not exists payments (
  id text primary key,
  user_email text not null default '',
  plan text not null,
  amount numeric not null,
  method text not null default 'PayFast',
  status text not null default 'Completed',
  created_at date not null default current_date
);

create table if not exists versions (
  version text primary key,
  date date not null,
  file text not null,
  size text not null default '',
  current boolean not null default false,
  notes text not null default ''
);

create table if not exists settings (
  key text primary key,
  value jsonb not null
);

-- Seed: current plugin version + default settings (matches the demo data).
insert into versions (version, date, file, size, current, notes) values
  ('2.1.0', '2026-11-14', 'modern-product-slider-pro-2.1.0.zip', '1.8 MB', true, 'New rack layouts, faster lazy loading, Elementor widget fixes.'),
  ('2.0.0', '2026-10-28', 'modern-product-slider-pro-2.0.0.zip', '1.7 MB', false, 'Pro add-on launch: unlimited sliders, licence activation.')
on conflict (version) do nothing;

insert into settings (key, value) values
  ('payfast', '{"enabled": true, "sandbox": true, "merchantId": "10000100", "merchantKey": "46f0cd694581a", "passphrase": "", "returnUrl": "https://modern-product-slider.vercel.app/dashboard/billing?payfast=success", "cancelUrl": "https://modern-product-slider.vercel.app/dashboard/billing?payfast=cancelled", "notifyUrl": "https://modern-product-slider.vercel.app/api/payfast/itn"}'::jsonb),
  ('oauth', '{"google": {"enabled": true, "clientId": "", "clientSecret": "", "redirect": "https://modern-product-slider.vercel.app/api/auth/google/callback"}, "facebook": {"enabled": false, "clientId": "", "clientSecret": "", "redirect": "https://modern-product-slider.vercel.app/api/auth/facebook/callback"}, "apple": {"enabled": false, "clientId": "", "clientSecret": "", "redirect": "https://modern-product-slider.vercel.app/api/auth/apple/callback"}}'::jsonb)
on conflict (key) do nothing;
