import type { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'red' | 'gold' | 'green';
}

const GLOW = {
  red:   'shadow-[0_0_40px_rgba(192,57,43,0.3)] border-red-900/40',
  gold:  'shadow-[0_0_40px_rgba(255,215,0,0.2)] border-yellow-700/40',
  green: 'shadow-[0_0_40px_rgba(46,204,64,0.2)] border-green-900/40',
};

export default function GlowCard({ children, className = '', glow = 'red' }: GlowCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-black/60 backdrop-blur-sm ${GLOW[glow]} ${className}`}
    >
      {children}
    </div>
  );
}
