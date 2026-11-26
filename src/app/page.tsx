/**
 * Landing — Start button only.
 * Challenge is resolved on the server so it's ready when the player starts.
 */

import { connection } from 'next/server';
import SnowBackground from '@/components/ui/SnowBackground';
import GameShell from '@/components/game/GameShell';
import { getActiveChallenge } from '@/lib/get-active-challenge';

export const instant = false;

export default async function HomePage() {
  await connection();
  const { challenge } = await getActiveChallenge();

  return (
    <main className="relative flex min-h-dvh flex-col">
      <SnowBackground />
      <div className="relative z-10 flex flex-1 flex-col">
        <GameShell initialChallenge={challenge} />
      </div>
    </main>
  );
}
