import 'server-only';

import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'xmas_admin';
export const ADMIN_CODE = process.env.ADMIN_ACCESS_CODE ?? 'RETRO@2026xyz';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function adminToken(): string {
  return createHash('sha256').update(`fatouta-admin:${ADMIN_CODE}`).digest('hex');
}

export function verifyAdminCode(code: string): boolean {
  const expected = Buffer.from(ADMIN_CODE);
  const received = Buffer.from(code);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = Buffer.from(adminToken());
  const received = Buffer.from(token);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export function adminCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  };
}

/** Returns a 401 response when the admin cookie is missing/invalid. */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
