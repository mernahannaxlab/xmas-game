import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  allowLocalStoreFallback,
  createAdminClient,
  hasAdminSupabaseConfig,
} from '@/lib/supabase/server';
import {
  deleteLocalChallenge,
  shouldUseLocalStore,
  updateLocalChallenge,
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

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/admin/challenges/[id]'>,
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (typeof body.title === 'string') patch.title = body.title;
    if (typeof body.description === 'string') patch.description = body.description;
    if (typeof body.instructions === 'string') patch.instructions = body.instructions;
    if (Array.isArray(body.hints)) patch.hints = body.hints.map(String);
    if (typeof body.published === 'boolean') patch.published = body.published;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const publishing = patch.published === true;

    if (hasAdminSupabaseConfig()) {
      try {
        const supabase = createAdminClient();

        if (publishing) {
          await supabase.from('challenges').update({ published: false }).neq('id', id);
        }

        const { error } = await supabase.from('challenges').update(patch).eq('id', id);
        if (!error) {
          return NextResponse.json({ success: true, storage: 'supabase' });
        }

        if (!allowLocalStoreFallback() || !shouldUseLocalStore(error)) {
          return supabaseFailure(error, 'update');
        }
        console.warn('Falling back to local store after update error:', error);
      } catch (err) {
        if (!allowLocalStoreFallback()) {
          return supabaseFailure(err, 'update');
        }
        console.warn('Supabase update threw, using local store:', err);
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

    const updated = await updateLocalChallenge(id, patch, { exclusivePublish: publishing });
    if (!updated) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, storage: 'local' });
  } catch (err) {
    console.error('PATCH challenge failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/challenges/[id]'>,
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  try {
    if (hasAdminSupabaseConfig()) {
      try {
        const supabase = createAdminClient();
        const { error } = await supabase.from('challenges').delete().eq('id', id);
        if (!error) {
          return NextResponse.json({ success: true, storage: 'supabase' });
        }

        if (!allowLocalStoreFallback() || !shouldUseLocalStore(error)) {
          return supabaseFailure(error, 'delete');
        }
        console.warn('Falling back to local store after delete error:', error);
      } catch (err) {
        if (!allowLocalStoreFallback()) {
          return supabaseFailure(err, 'delete');
        }
        console.warn('Supabase delete threw, using local store:', err);
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

    const ok = await deleteLocalChallenge(id);
    if (!ok) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, storage: 'local' });
  } catch (err) {
    console.error('DELETE challenge failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
