import { NextRequest, NextResponse } from 'next/server';
import {
  adminCookieOptions,
  adminToken,
  verifyAdminCode,
} from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code : '';

    if (!verifyAdminCode(code)) {
      return NextResponse.json({ error: 'كود غير صحيح' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(adminCookieOptions(adminToken()));
    return res;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
