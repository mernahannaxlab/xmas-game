import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';
import {
  createLocalChallenge,
  listLocalChallenges,
  shouldUseLocalStore,
} from '@/lib/local-store';

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

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('challenges')
        .insert(payload)
        .select('id')
        .single();

      if (!error && data?.id) {
        return NextResponse.json({ id: data.id }, { status: 201 });
      }

      console.error('Insert error:', error);
      if (!shouldUseLocalStore(error)) {
        return NextResponse.json(
          { error: error?.message ?? 'Failed to create challenge' },
          { status: 500 },
        );
      }
    } catch (err) {
      console.error('Supabase insert threw, using local store:', err);
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
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        return NextResponse.json({ challenges: data ?? [] });
      }
      console.error('Fetch challenges error:', error);
      if (!shouldUseLocalStore(error)) {
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
      }
    } catch (err) {
      console.error('Supabase fetch threw, using local store:', err);
    }

    const challenges = await listLocalChallenges();
    return NextResponse.json({ challenges, storage: 'local' });
  } catch (err) {
    console.error('List challenges failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
