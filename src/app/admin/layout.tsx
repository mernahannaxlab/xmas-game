import type { ReactNode } from 'react';
import { connection } from 'next/server';
import SnowBackground from '@/components/ui/SnowBackground';
import AdminNav from '@/components/admin/AdminNav';
import AdminLogin from '@/components/admin/AdminLogin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const instant = false;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await connection();
  const authed = await isAdminAuthenticated();

  return (
    <div className="relative min-h-dvh">
      <SnowBackground />
      <div className="relative z-10 flex min-h-dvh flex-col">
        {authed ? (
          <>
            <AdminNav />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          </>
        ) : (
          <AdminLogin />
        )}
      </div>
    </div>
  );
}
