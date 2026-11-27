/**
 * Challenge fallback store when Supabase is unavailable.
 * - Local/dev: .data/challenges.json under the project root
 * - Serverless: in-memory only (/var/task is read-only; /tmp is ephemeral)
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Challenge } from '@/types';

export type ChallengeInput = {
  title: string;
  description: string;
  instructions: string;
  hints?: string[];
  published?: boolean;
};

/** Statically scoped so Turbopack does not trace the whole project. */
const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'challenges.json');

let memoryStore: Challenge[] | null = null;

function isServerless(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.LAMBDA_TASK_ROOT ||
      process.cwd() === '/var/task',
  );
}

function normalizeChallenge(row: unknown): Challenge {
  const r = (row ?? {}) as Record<string, unknown>;
  return {
    id: String(r.id ?? ''),
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    instructions: String(r.instructions ?? ''),
    hints: Array.isArray(r.hints) ? r.hints.map(String) : [],
    published: Boolean(r.published),
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
  };
}

/** Read-only: never creates directories. */
async function readStoreQuietly(): Promise<Challenge[]> {
  if (memoryStore) return [...memoryStore];
  if (isServerless()) return [];

  try {
    const raw = await fs.readFile(/*turbopackIgnore: true*/ STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(normalizeChallenge) : [];
  } catch {
    return [];
  }
}

async function ensureStore(): Promise<Challenge[]> {
  if (memoryStore) return [...memoryStore];

  if (isServerless()) {
    memoryStore = [];
    return [];
  }

  try {
    await fs.mkdir(/*turbopackIgnore: true*/ DATA_DIR, { recursive: true });
    try {
      const raw = await fs.readFile(/*turbopackIgnore: true*/ STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.map(normalizeChallenge) : [];
    } catch {
      await fs.writeFile(/*turbopackIgnore: true*/ STORE_PATH, '[]', 'utf8');
      return [];
    }
  } catch (err) {
    console.warn('Local store filesystem unavailable, using memory:', err);
    memoryStore = [];
    return [];
  }
}

async function writeStore(rows: Challenge[]): Promise<void> {
  memoryStore = rows;
  if (isServerless()) return;

  try {
    await fs.mkdir(/*turbopackIgnore: true*/ DATA_DIR, { recursive: true });
    await fs.writeFile(
      /*turbopackIgnore: true*/ STORE_PATH,
      JSON.stringify(rows, null, 2),
      'utf8',
    );
  } catch (err) {
    console.warn('Local store write failed; kept in memory only:', err);
  }
}

export async function listLocalChallenges(): Promise<Challenge[]> {
  const rows = await ensureStore();
  return [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getLocalPublishedChallenge(): Promise<Challenge | null> {
  const rows = await readStoreQuietly();
  return rows.find((c) => c.published) ?? null;
}

export async function createLocalChallenge(input: ChallengeInput): Promise<Challenge> {
  const rows = await ensureStore();
  const now = new Date().toISOString();
  const challenge: Challenge = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    instructions: input.instructions,
    hints: input.hints ?? [],
    published: input.published ?? false,
    created_at: now,
    updated_at: now,
  };
  rows.push(challenge);
  await writeStore(rows);
  return challenge;
}

export async function updateLocalChallenge(
  id: string,
  patch: Partial<ChallengeInput> & Record<string, unknown>,
  options?: { exclusivePublish?: boolean },
): Promise<Challenge | null> {
  const rows = await ensureStore();
  const idx = rows.findIndex((c) => c.id === id);
  if (idx < 0) return null;

  const nextPublished =
    typeof patch.published === 'boolean' ? patch.published : rows[idx].published;

  const next: Challenge = {
    ...rows[idx],
    title: typeof patch.title === 'string' ? patch.title : rows[idx].title,
    description:
      typeof patch.description === 'string' ? patch.description : rows[idx].description,
    instructions:
      typeof patch.instructions === 'string' ? patch.instructions : rows[idx].instructions,
    hints: Array.isArray(patch.hints) ? (patch.hints as string[]) : rows[idx].hints,
    published: nextPublished,
    id: rows[idx].id,
    created_at: rows[idx].created_at,
    updated_at: new Date().toISOString(),
  };

  const updated = rows.map((row, i) => {
    if (i === idx) return next;
    if (options?.exclusivePublish && nextPublished) {
      return { ...row, published: false, updated_at: new Date().toISOString() };
    }
    return row;
  });

  await writeStore(updated);
  return next;
}

export async function deleteLocalChallenge(id: string): Promise<boolean> {
  const rows = await ensureStore();
  const next = rows.filter((c) => c.id !== id);
  if (next.length === rows.length) return false;
  await writeStore(next);
  return true;
}

/** True when Supabase error means "use local store instead". */
export function shouldUseLocalStore(error: unknown): boolean {
  if (!error) return true;
  if (typeof error !== 'object') return true;
  const e = error as { code?: string; message?: string; details?: string; hint?: string };
  const msg = `${e.code ?? ''} ${e.message ?? ''} ${e.details ?? ''} ${e.hint ?? ''}`.toLowerCase();
  if (!msg.trim()) return true;
  return (
    msg.includes('pgrst') ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache') ||
    msg.includes('permission denied') ||
    msg.includes('row-level security') ||
    msg.includes('rls') ||
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('enotfound') ||
    msg.includes('certificate') ||
    msg.includes('ssl') ||
    msg.includes('timeout') ||
    e.code === '42P01' ||
    e.code === 'PGRST301' ||
    e.code === 'PGRST205'
  );
  // Note: 42501 (permission denied) is NOT a local-store case — fix GRANTs / service role.
}
