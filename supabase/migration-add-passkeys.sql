-- Passkeys (WebAuthn) for Modern Product Slider.
-- Run once in Supabase → SQL Editor. The passkey API returns a clear
-- error until this table exists.
create table if not exists public.passkeys (
  id text primary key,
  user_id text not null,
  email text not null,
  credential_id text not null unique,
  public_key text not null,
  counter integer not null default 0,
  transports jsonb,
  name text,
  created_at text
);
