"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Env-gated Supabase client. If the two public env vars are not set, the app
// runs in local-only mode (localStorage) exactly as before, so nothing breaks
// until the backend is configured.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anon);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anon as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  is_admin: boolean;
  updated_at?: string;
}
