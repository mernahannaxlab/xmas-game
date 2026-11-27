import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function requireUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

/** New API keys only: sb_publishable_... (never legacy anon JWT). */
function publishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (Settings → API Keys → Publishable)',
    );
  }
  if (!key.startsWith('sb_publishable_')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be an sb_publishable_… key (not legacy anon)',
    );
  }
  return key;
}

/** New API keys only: sb_secret_... (never legacy service_role JWT). */
function secretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SECRET_KEY (Settings → API Keys → Secret). Server-only — never NEXT_PUBLIC_.',
    );
  }
  if (!key.startsWith('sb_secret_')) {
    throw new Error(
      'SUPABASE_SECRET_KEY must be an sb_secret_… key (not legacy service_role)',
    );
  }
  return key;
}

/** Cookie-free public client for published challenge reads. */
export function createPublicClient() {
  return createSupabaseClient(requireUrl(), publishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cookie-aware SSR client when auth sessions are needed. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(requireUrl(), publishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — ignore
        }
      },
    },
  });
}

/** Admin CRUD — secret key bypasses RLS (server only). */
export function createAdminClient() {
  return createSupabaseClient(requireUrl(), secretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function hasAdminSupabaseConfig(): boolean {
  return hasSupabaseConfig() && Boolean(process.env.SUPABASE_SECRET_KEY);
}

/** Local file fallback is for local/dev only — never on Vercel. */
export function allowLocalStoreFallback(): boolean {
  if (process.env.XMAS_ALLOW_LOCAL_STORE === '1') return true;
  if (process.env.XMAS_ALLOW_LOCAL_STORE === '0') return false;
  if (process.env.VERCEL) return false;
  return process.env.NODE_ENV !== 'production';
}
