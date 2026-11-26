'use client';

import { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

interface Star {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  animDelay: number;
}

export default function SnowBackground() {
  const [flakes, setFlakes] = useState<Snowflake[]>([]);
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setFlakes(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 8,
        size: 4 + Math.random() * 8,
      })),
    );
    setStars(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 60,
        width: 1 + Math.random() * 2,
        height: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
        animDelay: Math.random() * 3,
      })),
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Night sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0507] via-[#1A0810] to-[#0D0507]" />

      {/* Stars */}
      <div className="absolute inset-0 opacity-60">
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-yellow-100"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.width}px`,
              height: `${s.height}px`,
              opacity: s.opacity,
              animationDelay: `${s.animDelay}s`,
            }}
          />
        ))}
      </div>

      {/* Snow */}
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full bg-white opacity-70"
          style={{
            left: `${f.x}%`,
            top: '-10px',
            width: `${f.size}px`,
            height: `${f.size}px`,
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
