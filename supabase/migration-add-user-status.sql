-- Add a status column to users so the admin can suspend / reactivate
-- customers from the dashboard (Users page).
-- Run in Supabase -> SQL Editor -> New query -> Run.
alter table users add column if not exists status text not null default 'Active';
notify pgrst, 'reload schema';
