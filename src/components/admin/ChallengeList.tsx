'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { Challenge } from '@/types';

export default function ChallengeList({ challenges }: { challenges: Challenge[] }) {
  const router = useRouter();
  const [list, setList] = useState(challenges);
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setList(challenges);
  }, [challenges]);

  const togglePublish = (id: string, published: boolean) => {
    setBusyId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/challenges/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: !published }),
        });
        if (!res.ok) return;
        const nextPublished = !published;
        setList((prev) =>
          prev.map((c) => ({
            ...c,
            published: c.id === id ? nextPublished : nextPublished ? false : c.published,
          })),
        );
        router.refresh();
      } finally {
        setBusyId(null);
      }
    });
  };

  const remove = (id: string, title: string) => {
    if (!confirm(`حذف التحدي «${title}»؟`)) return;
    setBusyId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/challenges/${id}`, { method: 'DELETE' });
        if (!res.ok) return;
        setList((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      } finally {
        setBusyId(null);
      }
    });
  };

  if (!list.length) {
    return (
      <p className="text-sm text-red-500" dir="rtl">
        لا توجد تحديات بعد. أضف تحدي من النموذج فوق.
      </p>
    );
  }

  const published = list.find((c) => c.published);

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {published ? (
        <p className="rounded-lg border border-green-800/40 bg-green-950/30 px-3 py-2 text-xs text-green-300">
          التحدي النشط للاعبين: <span className="font-semibold text-yellow-200">{published.title}</span>
        </p>
      ) : (
        <p className="rounded-lg border border-yellow-900/40 bg-yellow-950/20 px-3 py-2 text-xs text-yellow-500">
          مفيش تحدي منشور دلوقتي — انشر تحدي عشان يظهر تحت فطوطة.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {list.map((c) => {
          const busy = busyId === c.id;
          return (
            <li
              key={c.id}
              className="flex flex-col gap-3 rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold text-yellow-200">{c.title}</span>
                <span className="truncate text-xs text-red-400">{c.description}</span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePublish(c.id, c.published)}
                  disabled={isPending}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                    c.published
                      ? 'bg-green-900/60 text-green-300 hover:bg-green-800/60'
                      : 'bg-red-900/60 text-red-300 hover:bg-red-800/60'
                  }`}
                  aria-label={c.published ? 'إلغاء النشر' : 'نشر التحدي'}
                >
                  {busy ? '…' : c.published ? 'منشور' : 'مسودة'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id, c.title)}
                  disabled={isPending}
                  className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-950/60 hover:text-red-300 disabled:opacity-50"
                  aria-label={`حذف ${c.title}`}
                >
                  حذف
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
