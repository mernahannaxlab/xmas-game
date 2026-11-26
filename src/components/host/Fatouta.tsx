'use client';

/**
 * Fatouta SVG — festive host with dancing bounce + waving arms.
 */

import styles from './Fatouta.module.css';

interface Props {
  dancing?: boolean;
  showBubble?: boolean;
  className?: string;
}

export default function Fatouta({
  dancing = false,
  showBubble = false,
  className = '',
}: Props) {
  return (
    <div className={`${styles.stage} ${className}`}>
      <div
        className={`${styles.bubble} ${showBubble ? styles.bubbleShow : ''}`}
        aria-hidden={!showBubble}
      >
        أكشن! 🎬
      </div>

      <svg
        className={`${styles.fatouta} ${dancing ? styles.dancing : ''}`}
        viewBox="0 0 200 260"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="فطوطة"
      >
        {/* Dense curly hair */}
        <circle cx="75" cy="45" r="22" fill="#1a1a1a" />
        <circle cx="125" cy="45" r="22" fill="#1a1a1a" />
        <circle cx="100" cy="32" r="25" fill="#1a1a1a" />
        <circle cx="65" cy="65" r="18" fill="#1a1a1a" />
        <circle cx="135" cy="65" r="18" fill="#1a1a1a" />
        <circle cx="88" cy="28" r="14" fill="#1a1a1a" />
        <circle cx="112" cy="28" r="14" fill="#1a1a1a" />

        {/* Face */}
        <ellipse cx="100" cy="68" rx="28" ry="30" fill="#ffcc99" />
        <circle cx="90" cy="62" r="4" fill="#000" />
        <circle cx="110" cy="62" r="4" fill="#000" />
        <path d="M83 54 Q90 50 96 55" stroke="#000" strokeWidth="3" fill="none" />
        <path d="M104 55 Q110 50 117 54" stroke="#000" strokeWidth="3" fill="none" />
        <path
          d="M92 75 Q100 71 108 75"
          stroke="#1a1a1a"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M90 82 Q100 92 110 82"
          stroke="#d32f2f"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body */}
        <path d="M55 100 L145 100 L160 195 L40 195 Z" fill="#2e7d32" />
        <path d="M55 100 L145 100 L160 195 L40 195 Z" fill="#ffffff" opacity="0.08" />
        <polygon points="85,98 100,115 100,98" fill="#ffffff" />
        <polygon points="115,98 100,115 100,98" fill="#ffffff" />

        {/* Bow + holly */}
        <polygon
          points="100,108 75,96 75,120"
          fill="#fdd835"
          stroke="#f57f17"
          strokeWidth="1.5"
        />
        <polygon
          points="100,108 125,96 125,120"
          fill="#fdd835"
          stroke="#f57f17"
          strokeWidth="1.5"
        />
        <circle cx="100" cy="108" r="6" fill="#fbc02d" />
        <path d="M92 98 C 86 92, 94 86, 98 92 Z" fill="#1b5e20" />
        <circle cx="94" cy="92" r="2.5" fill="#c0192b" />
        <path d="M108 98 C 114 92, 106 86, 102 92 Z" fill="#1b5e20" />
        <circle cx="106" cy="92" r="2.5" fill="#c0192b" />

        {/* Left arm — waves when dancing */}
        <g className={styles.armLeft}>
          <path d="M55 102 L25 165 L45 172 L65 125 Z" fill="#2e7d32" />
          <ellipse cx="30" cy="172" rx="12" ry="10" fill="#ffcc99" />
        </g>

        {/* Right arm — waves when dancing */}
        <g className={styles.armRight}>
          <path d="M145 102 L175 165 L155 172 L135 125 Z" fill="#2e7d32" />
          <ellipse cx="170" cy="172" rx="12" ry="10" fill="#ffcc99" />
        </g>

        {/* Pants */}
        <rect x="62" y="190" width="32" height="42" fill="#1b5e20" />
        <rect x="106" y="190" width="32" height="42" fill="#1b5e20" />

        {/* Shoes */}
        <ellipse cx="68" cy="238" rx="26" ry="12" fill="#d32f2f" />
        <ellipse cx="132" cy="238" rx="26" ry="12" fill="#d32f2f" />
        <ellipse cx="60" cy="236" rx="5" ry="4" fill="#ffd54f" />
        <ellipse cx="140" cy="236" rx="5" ry="4" fill="#ffd54f" />

        {/* Buttons */}
        <circle cx="100" cy="140" r="4" fill="#ffd54f" />
        <circle cx="100" cy="158" r="4" fill="#ffd54f" />
        <circle cx="100" cy="176" r="4" fill="#ffd54f" />
      </svg>
    </div>
  );
}
