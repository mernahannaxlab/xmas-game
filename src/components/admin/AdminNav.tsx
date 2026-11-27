'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function AdminNav() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const logout = () => {
    startTransition(async () => {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.refresh();
    });
  };

  return (
    <nav className="border-b border-red-900/30 bg-black/60 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-6">
        <Link href="/admin" className="text-sm font-bold text-yellow-300 hover:text-yellow-200">
          الإدارة
        </Link>
        <Link href="/admin/challenges" className="text-sm text-red-300 hover:text-red-200">
          التحديات
        </Link>
        <button
          type="button"
          onClick={logout}
          disabled={isPending}
          className="text-sm text-red-500 transition hover:text-red-300 disabled:opacity-50"
        >
          خروج
        </button>
        <Link href="/" className="mr-auto text-xs text-red-800 hover:text-red-600">
          ← العودة للعبة
        </Link>
      </div>
    </nav>
  );
}
