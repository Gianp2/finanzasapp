import React from 'react';
import { motion } from 'motion/react';

interface FinanceLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'splash';
  withWordmark?: boolean;
  withTagline?: boolean;
  animated?: boolean;
  variant?: 'light' | 'dark' | 'glass';
  className?: string;
}

export const FinanceLogo: React.FC<FinanceLogoProps> = ({
  size = 'md',
  withWordmark = false,
  withTagline = false,
  animated = true,
  variant = 'light',
  className = '',
}) => {
  // Dimension tokens
  const dimensions = {
    sm: { box: 'w-8 h-8', svg: 24, text: 'text-sm', badge: 'text-[9px]' },
    md: { box: 'w-11 h-11', svg: 32, text: 'text-base', badge: 'text-[10px]' },
    lg: { box: 'w-16 h-16', svg: 48, text: 'text-xl', badge: 'text-xs' },
    hero: { box: 'w-20 h-20 sm:w-24 sm:h-24', svg: 64, text: 'text-2xl sm:text-3xl', badge: 'text-xs' },
    splash: { box: 'w-24 h-24 sm:w-28 sm:h-28', svg: 76, text: 'text-3xl sm:text-4xl', badge: 'text-xs' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Logo Mark Container */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Soft Ambient Breathing Aura */}
        {animated && (
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.35, 0.65, 0.35],
            }}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: 'easeInOut',
            }}
            className="absolute -inset-2 rounded-[28px] bg-[#4A5A2E]/25 blur-xl pointer-events-none"
          />
        )}

        {/* Outer Orbit Ring (Hero/Splash) */}
        {animated && (size === 'hero' || size === 'splash') && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 26,
              ease: 'linear',
            }}
            className="absolute -inset-2.5 rounded-full border border-dashed border-[#4A5A2E]/30 pointer-events-none"
          />
        )}

        {/* Emblem Core Tile */}
        <motion.div
          whileHover={animated ? { scale: 1.05 } : undefined}
          whileTap={animated ? { scale: 0.95 } : undefined}
          className={`relative z-10 ${dimensions.box} rounded-[22px] sm:rounded-[26px] bg-gradient-to-br from-[#4A5A2E] via-[#3C4A24] to-[#2E391A] text-white flex items-center justify-center shadow-[0_10px_28px_rgba(74,90,46,0.32)] border border-[#687C43]/40 overflow-hidden`}
        >
          {/* Subtle Inner Glass Specular Highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 pointer-events-none" />

          {/* Crafted Vector Emblem */}
          <svg
            className="w-3/5 h-3/5 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Vault Coin Outer Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#E2E7D5"
              strokeWidth="3.5"
              strokeOpacity="0.45"
              strokeDasharray="4 3"
            />

            {/* Growth Leaf & Wealth Shield Structure */}
            <path
              d="M50 14 C72 14, 86 32, 86 52 C86 74, 68 86, 50 88 C32 86, 14 74, 14 52 C14 32, 28 14, 50 14 Z"
              fill="url(#financeLeafGrad)"
              fillOpacity="0.95"
            />

            {/* Inner Curvature / Petal of Prosperity */}
            <path
              d="M50 24 C64 36, 72 52, 72 65 C72 74, 62 80, 50 82 C38 80, 28 74, 28 65 C28 52, 36 36, 50 24 Z"
              fill="#2E391A"
              fillOpacity="0.85"
            />

            {/* Central Pillar of Wealth / Growth Arrow */}
            <path
              d="M50 34 L50 68 M40 44 L50 34 L60 44"
              stroke="#FAF9F5"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Champagne Gold Coin Accent Dot */}
            <circle cx="50" cy="54" r="4.5" fill="#C5A566" />

            <defs>
              <linearGradient id="financeLeafGrad" x1="14" y1="14" x2="86" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF9F5" />
                <stop offset="0.6" stopColor="#E2E7D5" />
                <stop offset="1" stopColor="#C5A566" />
              </linearGradient>
            </defs>
          </svg>

          {/* Gentle Shimmer Bar that sweeps across on animation */}
          {animated && (
            <motion.div
              animate={{
                x: ['-140%', '240%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 4.5,
                ease: 'easeInOut',
                repeatDelay: 2,
              }}
              className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
            />
          )}
        </motion.div>
      </div>

      {/* Typography Wordmark (Optional) */}
      {withWordmark && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight leading-none ${dimensions.text} ${
                variant === 'dark' ? 'text-white' : 'text-[#2B2D26]'
              }`}
            >
              Ciudad Financiera
            </span>
          </div>
          {withTagline && (
            <span
              className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase mt-1 ${
                variant === 'dark' ? 'text-white/70' : 'text-[#4A5A2E]'
              }`}
            >
              Control Consciente & Metas
            </span>
          )}
        </div>
      )}
    </div>
  );
};
