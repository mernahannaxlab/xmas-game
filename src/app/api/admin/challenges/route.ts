import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  allowLocalStoreFallback,
  createAdminClient,
  hasAdminSupabaseConfig,
} from '@/lib/supabase/server';
import {
  createLocalChallenge,
  listLocalChallenges,
  shouldUseLocalStore,
} from '@/lib/local-store';

function supabaseFailure(error: unknown, action: string) {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: string }).message)
      : String(error);
  console.error(`Supabase ${action} failed:`, error);
  return NextResponse.json(
    {
      error: `Supabase ${action} failed: ${message}`,
      hint:
        'Run src/lib/supabase/schema.sql in the SQL Editor. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY + SUPABASE_SECRET_KEY (sb_publishable_ / sb_secret_) in env.',
    },
    { status: 502 },
  );
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { title, description, instructions, hints } = body;

    if (!title || !description || !instructions) {
      return NextResponse.json(
        { error: 'title, description, and instructions are required' },
        { status: 400 },
      );
    }

    const payload = {
      title,
      description,
      instructions,
      hints: hints ?? [],
      published: false,
    };

    if (hasAdminSupabaseConfig()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from('challenges')
          .insert(payload)
          .select('id')
          .single();

        if (!error && data?.id) {
          return NextResponse.json({ id: data.id, storage: 'supabase' }, { status: 201 });
        }

        if (!allowLocalStoreFallback() || !shouldUseLocalStore(error)) {
          return supabaseFailure(error, 'insert');
        }
        console.warn('Falling back to local store after insert error:', error);
      } catch (err) {
        if (!allowLocalStoreFallback()) {
          return supabaseFailure(err, 'insert');
        }
        console.warn('Supabase insert threw, using local store:', err);
      }
    }

    if (!allowLocalStoreFallback()) {
      return NextResponse.json(
        {
          error:
            'Missing SUPABASE_SECRET_KEY (sb_secret_…). Add it in Vercel / .env.local — local store is disabled in production.',
        },
        { status: 500 },
      );
    }

    const local = await createLocalChallenge(payload);
    return NextResponse.json({ id: local.id, storage: 'local' }, { status: 201 });
  } catch (err) {
    console.error('Create challenge failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    if (hasAdminSupabaseConfig()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error) {
          return NextResponse.json({ challenges: data ?? [], storage: 'supabase' });
        }

        if (!allowLocalStoreFallback() || !shouldUseLocalStore(error)) {
          return supabaseFailure(error, 'list');
        }
        console.warn('Falling back to local store after list error:', error);
      } catch (err) {
        if (!allowLocalStoreFallback()) {
          return supabaseFailure(err, 'list');
        }
        console.warn('Supabase list threw, using local store:', err);
      }
    }

    if (!allowLocalStoreFallback()) {
      return NextResponse.json(
        {
          error:
            'Missing SUPABASE_SECRET_KEY (sb_secret_…). Add it in Vercel / .env.local — local store is disabled in production.',
        },
        { status: 500 },
      );
    }

    const challenges = await listLocalChallenges();
    return NextResponse.json({ challenges, storage: 'local' });
  } catch (err) {
    console.error('List challenges failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
