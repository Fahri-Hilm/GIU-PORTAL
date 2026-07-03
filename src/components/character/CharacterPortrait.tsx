'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getCharacterAssetPath, getCharacterFallbackPath } from './useCharacterAssets';
import type { Profile } from '@/lib/types';

const SIZE_MAP = {
  sm: { w: 96, h: 72, sizes: '96px' },
  md: { w: 200, h: 150, sizes: '200px' },
  lg: { w: 400, h: 300, sizes: '400px' },
  xl: { w: 640, h: 480, sizes: '640px' },
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
      animate={animate && !reducedMotion ? { y: [0, -5, 0] } : undefined}
      transition={animate && !reducedMotion ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated via-surface to-surface-container-lowest animate-pulse rounded-lg" />
      )}

      <Image
        src={imgSrc}
        alt={profile.codename ?? profile.full_name}
        fill
        sizes={sizes}
        className={cn(
          'object-cover rounded-lg transition-all duration-700',
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110',
        )}
        style={{
          filter: loaded ? 'brightness(1.15) contrast(1.1) saturate(1.05)' : undefined,
        }}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        priority={size === 'xl'}
      />

      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: `
            inset 0 0 40px rgba(0,0,0,0.4),
            inset 0 -60px 60px -20px rgba(0,0,0,0.5),
            0 0 25px -5px var(--color-primary),
            0 0 50px -10px var(--color-primary)
          `,
        }}
      />

      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.15)_2px,rgba(255,255,255,0.15)_4px)] rounded-lg" />

      <div className="absolute inset-0 rounded-lg pointer-events-none border border-primary/15" />

      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none rounded-b-lg" />

      {animate && !reducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 30px rgba(0,0,0,0.3)',
              'inset 0 0 50px rgba(0,0,0,0.5)',
              'inset 0 0 30px rgba(0,0,0,0.3)',
            ],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      )}

      {size === 'xl' && (
        <div className="absolute top-3 left-3 right-3 pointer-events-none">
          <div className="flex items-center gap-1.5 opacity-40">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <div className="font-data-mono text-[8px] text-primary tracking-wider">
              LIVE FEED
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
