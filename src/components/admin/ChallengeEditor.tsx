'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface FormValues {
  title: string;
  description: string;
  instructions: string;
  hints: string;
}

const EMPTY: FormValues = {
  title: '',
  description: '',
  instructions: '',
  hints: '',
};

const FIELDS: {
  key: keyof FormValues;
  label: string;
  type: 'input' | 'textarea';
  placeholder: string;
  rows?: number;
}[] = [
  { key: 'title', label: 'عنوان التحدي', type: 'input', placeholder: 'مثلاً: زينة الشجرة' },
  { key: 'description', label: 'الوصف', type: 'textarea', placeholder: 'وصف مختصر يظهر للاعبين', rows: 2 },
  { key: 'instructions', label: 'التعليمات', type: 'textarea', placeholder: 'خطوات التحدي بالتفصيل', rows: 4 },
  {
    key: 'hints',
    label: 'التلميحات (سطر لكل تلميح)',
    type: 'textarea',
    placeholder: 'تلميح ١\nتلميح ٢',
    rows: 3,
  },
];

export default function ChallengeEditor() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const field = (key: keyof FormValues) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim() || !values.description.trim() || !values.instructions.trim()) {
      setError('العنوان والوصف والتعليمات مطلوبة');
      return;
    }
    setError('');
    setSuccess('');

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: values.title.trim(),
            description: values.description.trim(),
            instructions: values.instructions.trim(),
            hints: values.hints
              .split('\n')
              .map((h) => h.trim())
              .filter(Boolean),
          }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(d.error ?? 'حدث خطأ');
          return;
        }
        if (d.storage === 'local') {
          setSuccess(
            'تم الحفظ محلياً فقط — جدول challenges مش موجود/متاح في Supabase. شغّل schema.sql في SQL Editor.',
          );
        } else {
          setSuccess('تم الحفظ في Supabase كمسودة. انشره من القائمة عشان يظهر للاعبين.');
        }
        setValues(EMPTY);
        router.refresh();
      } catch {
        setError('تعذر الحفظ');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate dir="rtl">
      {FIELDS.map(({ key, label, type, placeholder, rows }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-xs font-semibold tracking-wider text-red-300">{label}</label>
          {type === 'input' ? (
            <input
              type="text"
              placeholder={placeholder}
              className="rounded-lg border border-red-800/40 bg-red-950/30 px-3 py-2 text-sm text-yellow-100 placeholder-red-700 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
              {...field(key)}
            />
          ) : (
            <textarea
              rows={rows ?? 3}
              placeholder={placeholder}
              className="resize-y rounded-lg border border-red-800/40 bg-red-950/30 px-3 py-2 text-sm text-yellow-100 placeholder-red-700 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
              {...field(key)}
            />
          )}
        </div>
      ))}

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-xs text-green-400">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gradient-to-r from-red-700 to-red-900 px-5 py-2 text-xs font-semibold text-yellow-200 shadow transition hover:from-red-600 hover:to-red-800 disabled:opacity-50"
      >
        {isPending ? 'جاري الحفظ...' : 'حفظ التحدي'}
      </button>
    </form>
  );
}
