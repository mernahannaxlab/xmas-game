'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Challenge } from '@/types';
import GlowCard from '@/components/ui/GlowCard';
import ChallengeEditor from './ChallengeEditor';
import ChallengeList from './ChallengeList';

export default function ChallengesManager({ challenges }: { challenges: Challenge[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Challenge | null>(null);

  const handleSaved = () => {
    setEditing(null);
    router.refresh();
  };

  return (
    <>
      <GlowCard className="p-5" glow="red">
        <h2 className="mb-4 text-base font-semibold text-yellow-200">
          {editing ? 'تعديل التحدي' : 'تحدي جديد'}
        </h2>
        <ChallengeEditor
          editing={editing}
          onSaved={handleSaved}
          onCancelEdit={() => setEditing(null)}
        />
      </GlowCard>

      <GlowCard className="p-5" glow="gold">
        <h2 className="mb-4 text-base font-semibold text-yellow-200">التحديات المتاحة</h2>
        <ChallengeList
          challenges={challenges}
          editingId={editing?.id ?? null}
          onEdit={(challenge) => {
            setEditing(challenge);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </GlowCard>
    </>
  );
}
