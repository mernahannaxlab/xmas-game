import { connection } from 'next/server';
import ChallengesManager from '@/components/admin/ChallengesManager';
import {
  allowLocalStoreFallback,
  createAdminClient,
  hasAdminSupabaseConfig,
} from '@/lib/supabase/server';
import { listLocalChallenges, shouldUseLocalStore } from '@/lib/local-store';
import type { Challenge } from '@/types';

export const instant = false;

export default async function ChallengesPage() {
  await connection();

  let challenges: Challenge[] = [];
  let storage: 'supabase' | 'local' = 'local';
  let remoteError: string | null = null;

  if (hasAdminSupabaseConfig()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        challenges = data as Challenge[];
        storage = 'supabase';
      } else {
        remoteError = error?.message ?? 'Unknown Supabase error';
        if (allowLocalStoreFallback() && shouldUseLocalStore(error)) {
          challenges = await listLocalChallenges();
        }
      }
    } catch (err) {
      remoteError = err instanceof Error ? err.message : String(err);
      if (allowLocalStoreFallback()) {
        challenges = await listLocalChallenges();
      }
    }
  } else if (allowLocalStoreFallback()) {
    challenges = await listLocalChallenges();
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-yellow-300">التحديات</h1>
        <p className="mt-1 text-xs text-red-500">
          التحدي المنشور هو اللي بيظهر تحت فطوطة للاعبين
          {storage === 'local' ? ' · تخزين محلي (مش Supabase)' : ' · Supabase'}
        </p>
      </div>

      {storage === 'local' && (
        <div className="rounded-xl border border-yellow-700/40 bg-yellow-950/30 px-4 py-3 text-xs leading-relaxed text-yellow-200">
          الحفظ الآن محلي — مش على Supabase
          {remoteError ? ` (${remoteError})` : ''}. نفّذ{' '}
          <code className="text-yellow-100">src/lib/supabase/schema.sql</code> كامل في SQL Editor
          لمشروع <strong>Xmas&apos;s Project</strong> (يشمل GRANT)، وضيف{' '}
          <code className="text-yellow-100">SUPABASE_SECRET_KEY</code> (
          <code className="text-yellow-100">sb_secret_…</code>) في Vercel و .env.local.
        </div>
      )}

      <ChallengesManager challenges={challenges} />
    </div>
  );
}
