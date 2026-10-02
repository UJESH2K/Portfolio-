import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client, authenticated with the service-role key so it bypasses
 * Row Level Security. Never import this from a "use client" component —
 * it holds a secret key.
 *
 * Returns null when env vars are not set yet, so the site can still render
 * with static fallback content before Supabase is configured.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
