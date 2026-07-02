'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getCharacterAssetPath, getCharacterFallbackPath } from './useCharacterAssets';
import type { Profile } from '@/lib/types';

const SIZE_MAP = {
  sm: { w: 80, h: 120, sizes: '80px' },
  md: { w: 160, h: 240, sizes: '160px' },
  lg: { w: 320, h: 480, sizes: '320px' },
  xl: { w: 512, h: 768, sizes: '512px' },
} as const;

interface CharacterPortraitProps {
  profile: Profile;
  size?: keyof typeof SIZE_MAP;
  className?: string;
  animate?: boolean;
}

export function CharacterPortrait({ profile, size = 'md', className, animate = true }: CharacterPortraitProps) {
  const [imgSrc, setImgSrc] = useState(getCharacterAssetPath(profile));
  const [loaded, setLoaded] = useState(false);
  const reducedMotion = useReducedMotion();
  const { w, h, sizes } = SIZE_MAP[size];

  const handleError = useCallback(() => {
    if (imgSrc !== getCharacterFallbackPath()) {
      setImgSrc(getCharacterFallbackPath());
    }
  }, [imgSrc]);

  return (
    <motion.div
      className={cn('relative overflow-hidden rounded-lg', className)}
      style={{ width: w, height: h }}
      animate={animate && !reducedMotion ? { y: [0, -4, 0] } : undefined}
      transition={animate && !reducedMotion ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated to-surface animate-pulse rounded-lg" />
      )}

      <Image
        src={imgSrc}
        alt={profile.codename ?? profile.full_name}
        fill
        sizes={sizes}
        className={cn(
          'object-cover rounded-lg transition-all duration-500',
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
        )}
        style={{
          filter: loaded ? 'brightness(1.1) contrast(1.05)' : undefined,
        }}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        priority={size === 'xl'}
      />

      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: `
            inset 0 0 30px rgba(0,0,0,0.3),
            0 0 20px -5px var(--color-primary),
            0 0 40px -10px var(--color-primary)
          `,
        }}
      />

      <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.2)_2px,rgba(255,255,255,0.2)_4px)] rounded-lg" />

      <div className="absolute inset-0 rounded-lg pointer-events-none border border-primary/20" />

      {animate && !reducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 20px rgba(0,0,0,0.2)',
              'inset 0 0 30px rgba(0,0,0,0.4)',
              'inset 0 0 20px rgba(0,0,0,0.2)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
