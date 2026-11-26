'use client';

import type { Challenge } from '@/types';
import GlowCard from '@/components/ui/GlowCard';

export default function ChallengePanel({ challenge }: { challenge: Challenge }) {
  return (
    <GlowCard className="flex flex-col gap-4 p-5" glow="green">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 text-2xl" aria-hidden="true">
          🎯
        </span>
        <h2 className="text-lg font-bold leading-tight text-yellow-200" dir="rtl">
          {challenge.title}
        </h2>
      </div>

      <p className="text-sm leading-relaxed text-red-200" dir="rtl">
        {challenge.description}
      </p>

      <div className="rounded-xl border border-green-800/30 bg-green-950/40 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-400">
          التعليمات
        </h3>
        <p className="text-sm leading-relaxed text-yellow-100" dir="rtl">
          {challenge.instructions}
        </p>
      </div>

      {challenge.hints.length > 0 && (
        <div className="rounded-xl border border-yellow-900/30 bg-yellow-950/30 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-600">
            تلميحات
          </h3>
          <ul className="flex flex-col gap-1" dir="rtl">
            {challenge.hints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-yellow-200">
                <span className="flex-shrink-0 text-yellow-500" aria-hidden="true">
                  💡
                </span>
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlowCard>
  );
}
