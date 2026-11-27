import 'server-only';

import type { Challenge } from '@/types';
import { getLocalPublishedChallenge } from '@/lib/local-store';
import {
  allowLocalStoreFallback,
  createPublicClient,
  hasSupabaseConfig,
} from '@/lib/supabase/server';

const REMOTE_TIMEOUT_MS = 2500;

const CHALLENGE_COLUMNS =
  'id,title,description,instructions,hints,published,created_at,updated_at';

function normalize(row: Record<string, unknown> | null): Challenge | null {
  if (!row) return null;
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    instructions: String(row.instructions ?? ''),
    hints: Array.isArray(row.hints) ? row.hints.map(String) : [],
    published: Boolean(row.published),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

async function fetchRemoteChallenge(): Promise<Challenge | null> {
  if (!hasSupabaseConfig()) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('challenges')
      .select(CHALLENGE_COLUMNS)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('Active challenge remote error:', error);
      return null;
    }
    return normalize((data as Record<string, unknown> | null) ?? null);
  } catch (err) {
    console.error('Active challenge remote threw:', err);
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

/** Prefer Supabase; local file is a local/dev fallback only. */
export async function getActiveChallenge(): Promise<{
  challenge: Challenge | null;
  storage?: 'local' | 'supabase';
}> {
  const remote = await withTimeout(fetchRemoteChallenge(), REMOTE_TIMEOUT_MS);
  if (remote) return { challenge: remote, storage: 'supabase' };

  if (allowLocalStoreFallback()) {
    const local = await getLocalPublishedChallenge();
    if (local) return { challenge: local, storage: 'local' };
  }

  return { challenge: null };
}
