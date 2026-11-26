import { NextResponse } from 'next/server';
import { getActiveChallenge } from '@/lib/get-active-challenge';

export async function GET() {
  try {
    const result = await getActiveChallenge();
    return NextResponse.json(result, {
      headers: {
        // Short private cache so repeat visits feel instant
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
