import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import GlowCard from '@/components/ui/GlowCard';
import ChallengeEditor from '@/components/admin/ChallengeEditor';
import ChallengeList from '@/components/admin/ChallengeList';
import { listLocalChallenges, shouldUseLocalStore } from '@/lib/local-store';
import type { Challenge } from '@/types';

export const instant = false;

export default async function ChallengesPage() {
  await connection();

  let challenges: Challenge[] = [];
  let storage: 'supabase' | 'local' = 'local';

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      challenges = data as Challenge[];
      storage = 'supabase';
    } else if (shouldUseLocalStore(error)) {
      challenges = await listLocalChallenges();
    }
  } catch {
    challenges = await listLocalChallenges();
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-yellow-300">التحديات</h1>
        <p className="mt-1 text-xs text-red-500">
          التحدي المنشور هو اللي بيظهر تحت فطوطة للاعبين
          {storage === 'local' ? ' · تخزين محلي' : ''}
        </p>
      </div>

      <GlowCard className="p-5" glow="red">
        <h2 className="mb-4 text-base font-semibold text-yellow-200">تحدي جديد</h2>
        <ChallengeEditor />
      </GlowCard>

      <GlowCard className="p-5" glow="gold">
        <h2 className="mb-4 text-base font-semibold text-yellow-200">التحديات المتاحة</h2>
        <ChallengeList challenges={challenges} />
      </GlowCard>
    </div>
  );
}
