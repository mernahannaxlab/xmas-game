import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';
import {
  deleteLocalChallenge,
  shouldUseLocalStore,
  updateLocalChallenge,
} from '@/lib/local-store';

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/admin/challenges/[id]'>,
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const publishing = body.published === true;

    try {
      const supabase = await createClient();

      if (publishing) {
        // Only one active challenge for players
        await supabase.from('challenges').update({ published: false }).neq('id', id);
      }

      const { error } = await supabase.from('challenges').update(body).eq('id', id);
      if (!error) {
        return NextResponse.json({ success: true });
      }
      console.error('Update challenge error:', error);
      if (!shouldUseLocalStore(error)) {
        return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
      }
    } catch (err) {
      console.error('Supabase update threw, using local store:', err);
    }

    const updated = await updateLocalChallenge(id, body, { exclusivePublish: publishing });
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
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('challenges').delete().eq('id', id);
      if (!error) {
        return NextResponse.json({ success: true });
      }
      console.error('Delete challenge error:', error);
      if (!shouldUseLocalStore(error)) {
        return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 });
      }
    } catch (err) {
      console.error('Supabase delete threw, using local store:', err);
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
