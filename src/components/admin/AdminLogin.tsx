'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import GlowCard from '@/components/ui/GlowCard';

export default function AdminLogin() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? 'كود غير صحيح');
          return;
        }
        router.refresh();
      } catch {
        setError('تعذر الاتصال');
      }
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16" dir="rtl">
      <GlowCard className="w-full max-w-sm p-6" glow="red">
        <h1 className="mb-1 text-xl font-bold text-yellow-300">دخول الإدارة</h1>
        <p className="mb-5 text-xs text-red-400">أدخل كود الدخول عشان توصل للوحة التحكم</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="admin-code" className="text-xs font-semibold text-red-300">
              كود الدخول
            </label>
            <input
              id="admin-code"
              type="password"
              autoComplete="current-password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-red-800/40 bg-red-950/30 px-3 py-2 text-sm text-yellow-100 placeholder-red-700 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !code.trim()}
            className="rounded-lg bg-gradient-to-r from-red-700 to-red-900 px-5 py-2.5 text-sm font-semibold text-yellow-200 shadow transition hover:from-red-600 hover:to-red-800 disabled:opacity-50"
          >
            {isPending ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </GlowCard>
    </div>
  );
}
