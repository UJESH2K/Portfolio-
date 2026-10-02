-- pfl admin schema
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: every statement is idempotent.

create extension if not exists "pgcrypto";

-- ── Projects ────────────────────────────────────────────────────────────
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text default '',
  description text default '',
  stack text[] default '{}',
  repo text,
  live text,
  image_url text,
  video_url text,
  -- "personal" (default) shows in the Featured Work chapter, "freelance" in
  -- the separate Freelance chapter — same table, two honest categories.
  category text default 'personal',
  featured boolean default false,
  year text not null,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table projects add column if not exists video_url text;
alter table projects add column if not exists category text default 'personal';

-- ── Career timeline ─────────────────────────────────────────────────────
create table if not exists timeline_entries (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  detail text default '',
  tag text default 'code', -- code | win | work | life
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Achievements / trophies ─────────────────────────────────────────────
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  short text not null,
  title text not null,
  detail text default '',
  year text not null,
  tier text default 'bronze', -- gold | silver | bronze
  href text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Hackathons ──────────────────────────────────────────────────────────
create table if not exists hackathons (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  project text not null,
  placement text default '',
  year text not null,
  blurb text default '',
  href text,
  live text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── LinkedIn-style posts / updates feed ─────────────────────────────────
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  caption text not null,
  image_url text,
  link_url text,
  link_label text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ── Meeting / freelance requests submitted from the site widget ─────────
create table if not exists meeting_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  budget text,
  project_type text,
  preferred_date text,
  message text not null,
  status text default 'new', -- new | read | replied | archived
  created_at timestamptz default now()
);

-- ── Storage bucket for admin-uploaded photos ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Row Level Security: locked down. All reads/writes for the site go through
-- server-side API routes using the service-role key, which bypasses RLS.
-- The anon/public key (if ever used client-side) gets NO access by default.
alter table projects enable row level security;
alter table timeline_entries enable row level security;
alter table achievements enable row level security;
alter table hackathons enable row level security;
alter table posts enable row level security;
alter table meeting_requests enable row level security;
