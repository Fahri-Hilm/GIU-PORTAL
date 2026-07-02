'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CharacterPortrait } from './CharacterPortrait';
import { getCharacterBgPath } from './useCharacterAssets';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/types';

const ROLE_LABELS: Record<Profile['role'], string> = {
  admin: 'ADMINISTRATOR',
  commander: 'KOMANDAN',
  analyst: 'ANALIS',
};

interface FeaturedCharacterProps {
  profile: Profile | null;
  className?: string;
}

export function FeaturedCharacter({ profile, className }: FeaturedCharacterProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, [reducedMotion]);

  return (
    <div
      className={cn(
        'relative h-full min-h-[500px] rounded-xl overflow-hidden border border-on-surface-muted/20',
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      {profile ? (
        <>
          <motion.div
            className="absolute inset-0"
            animate={reducedMotion ? undefined : { x: mousePos.x * -10, y: mousePos.y * -10 }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          >
            <Image
              src={getCharacterBgPath(profile.codename)}
              alt=""
              fill
              className="object-cover opacity-30"
              sizes="100vw"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

          <div className="relative h-full flex flex-col items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 50 }}
                transition={{ duration: 0.3 }}
                className={cn(!reducedMotion && 'motion-safe:animate-in')}
              >
                <CharacterPortrait profile={profile} size="xl" animate />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={profile.id + '-info'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-center mt-6 space-y-1"
              >
                <h2 className="font-heading text-2xl text-primary tracking-widest glitch-text">
                  {profile.codename?.toUpperCase() ?? 'OPERATOR'}
                </h2>
                <p className="font-data-mono text-sm text-on-surface-muted">{profile.full_name}</p>
                <p className="font-data-mono text-xs text-on-surface-muted">{profile.rank}</p>
                <span className={cn(
                  'inline-block px-2 py-0.5 rounded font-data-mono text-[10px] tracking-wider mt-1',
                  profile.role === 'admin' ? 'bg-threat-critical/20 text-threat-critical' :
                  profile.role === 'commander' ? 'bg-primary/20 text-primary' :
                  'bg-status-active/20 text-status-active',
                )}>
                  {ROLE_LABELS[profile.role]}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-on-surface-muted/20 rounded-xl">
          <div className="text-center space-y-2 animate-pulse">
            <p className="font-heading text-lg text-on-surface-muted tracking-widest">PILIH PERSONEL</p>
            <p className="font-data-mono text-xs text-on-surface-muted">Klik kartu di sebelah kiri</p>
          </div>
        </div>
      )}
    </div>
  );
}
