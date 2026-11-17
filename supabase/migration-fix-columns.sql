-- Fix for: PGRST204 "Could not find the 'password_hash' column of 'users'"
-- Run this in Supabase -> SQL Editor -> New query -> Run.
-- It happens when the tables already existed (e.g. created earlier or by a
-- partial run) so CREATE TABLE IF NOT EXISTS skipped them. This adds every
-- column the backend needs, then tells PostgREST to reload its schema cache.

alter table users add column if not exists name text;
alter table users add column if not exists email text;
alter table users add column if not exists password_hash text not null default '';
alter table users add column if not exists role text not null default 'customer';
alter table users add column if not exists provider text not null default 'email';
alter table users add column if not exists created_at date not null default current_date;

alter table licenses add column if not exists key text;
alter table licenses add column if not exists user_email text not null default '';
alter table licenses add column if not exists plan text;
alter table licenses add column if not exists domain text;
alter table licenses add column if not exists status text not null default 'Active';
alter table licenses add column if not exists version text not null default '2.1.0';
alter table licenses add column if not exists created_at date not null default current_date;
alter table licenses add column if not exists last_check text not null default '—';

alter table payments add column if not exists user_email text not null default '';
alter table payments add column if not exists plan text;
alter table payments add column if not exists amount numeric;
alter table payments add column if not exists method text not null default 'PayFast';
alter table payments add column if not exists status text not null default 'Completed';
alter table payments add column if not exists created_at date not null default current_date;

alter table versions add column if not exists date date;
alter table versions add column if not exists file text;
alter table versions add column if not exists size text not null default '';
alter table versions add column if not exists current boolean not null default false;
alter table versions add column if not exists notes text not null default '';

-- Refresh PostgREST's schema cache so the new columns are visible at once.
notify pgrst, 'reload schema';
