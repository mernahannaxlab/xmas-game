'use client';

import { useEffect, useState, useTransition } from 'react';
import type { Challenge } from '@/types';

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

function toValues(challenge: Challenge): FormValues {
  return {
    title: challenge.title,
    description: challenge.description,
    instructions: challenge.instructions,
    hints: challenge.hints.join('\n'),
  };
}

const FIELDS: {
  key: keyof FormValues;
  label: string;
  type: 'input' | 'textarea';
  placeholder: string;
  rows?: number;
  hint?: string;
}[] = [
  { key: 'title', label: 'عنوان التحدي', type: 'input', placeholder: 'مثلاً: زينة الشجرة' },
  {
    key: 'description',
    label: 'الوصف',
    type: 'textarea',
    placeholder: 'وصف مختصر يظهر للاعبين',
    rows: 2,
  },
  {
    key: 'instructions',
    label: 'التعليمات',
    type: 'textarea',
    placeholder: 'خطوات التحدي… ممكن تضيف رابط مثل https://example.com',
    rows: 4,
    hint: 'لو فيه رابط http/https هيظهر قابل للضغط عند اللاعبين',
  },
  {
    key: 'hints',
    label: 'التلميحات (سطر لكل تلميح)',
    type: 'textarea',
    placeholder: 'تلميح ١\nتلميح ٢',
    rows: 3,
  },
];

interface Props {
  editing?: Challenge | null;
  onSaved?: () => void;
  onCancelEdit?: () => void;
}

export default function ChallengeEditor({
  editing = null,
  onSaved,
  onCancelEdit,
}: Props) {
  const [values, setValues] = useState<FormValues>(
    editing ? toValues(editing) : EMPTY,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setValues(editing ? toValues(editing) : EMPTY);
    setError('');
    setSuccess(editing ? `تعديل: ${editing.title}` : '');
  }, [editing]);

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

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      instructions: values.instructions.trim(),
      hints: values.hints
        .split('\n')
        .map((h) => h.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      try {
        const res = await fetch(
          editing ? `/api/admin/challenges/${editing.id}` : '/api/admin/challenges',
          {
            method: editing ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        const d = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError([d.error, d.hint].filter(Boolean).join(' — ') || 'حدث خطأ');
          return;
        }
        if (d.storage === 'local') {
          setSuccess(
            editing
              ? 'تم التعديل محلياً فقط (مش Supabase).'
              : 'تم الحفظ محلياً فقط — جدول challenges مش موجود/متاح في Supabase.',
          );
        } else {
          setSuccess(editing ? 'تم تحديث التحدي في Supabase.' : 'تم الحفظ في Supabase كمسودة.');
        }
        if (!editing) setValues(EMPTY);
        onSaved?.();
      } catch {
        setError('تعذر الحفظ');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate dir="rtl">
      {editing && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-yellow-800/40 bg-yellow-950/20 px-3 py-2 text-xs text-yellow-300">
          <span>تعديل التحدي: {editing.title}</span>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-full bg-black/30 px-3 py-1 text-red-300 transition hover:text-red-200"
            >
              إلغاء
            </button>
          )}
        </div>
      )}

      {FIELDS.map(({ key, label, type, placeholder, rows, hint }) => (
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
          {hint && <p className="text-[11px] text-red-500">{hint}</p>}
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
        {isPending ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'حفظ التحدي'}
      </button>
    </form>
  );
}
