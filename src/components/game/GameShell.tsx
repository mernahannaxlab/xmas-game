'use client';

/**
 * Player flow: Start → Fatouta (dancing) + extracted_audio once → challenge below.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import Fatouta from '@/components/host/Fatouta';
import ChallengePanel from './ChallengePanel';
import type { Challenge } from '@/types';
import GlowCard from '@/components/ui/GlowCard';
import { FatoutaAudio } from '@/lib/fatouta-audio';

type Phase = 'ready' | 'playing';

interface Props {
  initialChallenge?: Challenge | null;
}

export default function GameShell({ initialChallenge = null }: Props) {
  const audioRef = useRef<FatoutaAudio | null>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [challenge, setChallenge] = useState<Challenge | null>(initialChallenge);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [dancing, setDancing] = useState(false);
  const [audioOn, setAudioOn] = useState(false);

  const fetchChallenge = useCallback(async () => {
    setLoadingChallenge(true);
    try {
      const res = await fetch('/api/challenge/active', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      const next = (data.challenge ?? null) as Challenge | null;
      setChallenge(next);
      return next;
    } catch {
      return null;
    } finally {
      setLoadingChallenge(false);
    }
  }, []);

  useEffect(() => {
    const audio = new FatoutaAudio();
    audioRef.current = audio;
    audio.onEnded(() => setAudioOn(false));

    // Only refetch if the server didn't already provide one
    if (!initialChallenge) {
      void fetchChallenge();
    }

    return () => audio.stop();
  }, [fetchChallenge, initialChallenge]);

  const playTrack = useCallback(() => {
    audioRef.current?.start();
    setAudioOn(true);
    setDancing(true);
  }, []);

  const handleStart = useCallback(() => {
    if (phase !== 'ready') return;
    setPhase('playing');
    playTrack();
    if (!challenge) void fetchChallenge();
  }, [phase, challenge, playTrack, fetchChallenge]);

  const replayOrStop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.isPlaying) {
      audio.stop();
      setAudioOn(false);
      return;
    }
    playTrack();
  }, [playTrack]);

  if (phase === 'ready') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-8 text-center animate-fade-in">
          <p className="text-sm tracking-[0.25em] text-yellow-500/80 uppercase">RETRO XLAB</p>
          <h1 className="text-3xl font-bold text-yellow-300 sm:text-4xl" dir="rtl">
            كريسماس زي زمان
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-red-200/90" dir="rtl">
            اضغط ابدأ عشان تشوف التحدي.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="min-w-[220px] rounded-full bg-[#2e7d32] px-10 py-4 text-lg font-bold text-white shadow-[0_8px_24px_rgba(46,125,50,0.45)] transition hover:bg-[#1b5e20] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300"
          >
            ابدأ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-5 px-4 py-6">
      <div className="flex w-full max-w-lg flex-col items-center gap-3 animate-fade-in">
        <Fatouta dancing={dancing} showBubble={dancing} />
        <button
          type="button"
          onClick={replayOrStop}
          className="rounded-full border border-green-800/40 bg-green-950/50 px-4 py-2 text-xs font-medium text-green-100 transition hover:bg-green-900/50"
          aria-label={audioOn ? 'إيقاف الصوت' : 'إعادة أكشن'}
        >
          {audioOn ? 'إيقاف الصوت ⏹️' : 'أكشن! 🔊'}
        </button>
      </div>

      <div className="flex w-full max-w-lg flex-col gap-4 animate-fade-in">
        {challenge ? (
          <ChallengePanel challenge={challenge} />
        ) : (
          <GlowCard className="p-5 text-center" glow="red">
            <p className="text-red-300" dir="rtl">
              {loadingChallenge
                ? 'جاري تحميل التحدي…'
                : 'مفيش تحديات متاحة دلوقتي. انشر تحدي من لوحة الإدارة!'}
            </p>
          </GlowCard>
        )}
      </div>
    </div>
  );
}
