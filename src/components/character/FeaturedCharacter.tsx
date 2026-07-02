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

const ROLE_STYLES: Record<Profile['role'], { border: string; bg: string; text: string }> = {
  admin: { border: 'border-threat-critical/60', bg: 'bg-threat-critical/10', text: 'text-threat-critical' },
  commander: { border: 'border-primary/60', bg: 'bg-primary/10', text: 'text-primary' },
  analyst: { border: 'border-status-active/60', bg: 'bg-status-active/10', text: 'text-status-active' },
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
        'relative h-full min-h-[500px] rounded-xl overflow-hidden',
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      {profile ? (
        <>
          <div className="absolute inset-0 bg-surface" />

          <motion.div
            className="absolute inset-0"
            animate={reducedMotion ? undefined : { x: mousePos.x * -15, y: mousePos.y * -15 }}
            transition={{ type: 'spring', stiffness: 80, damping: 25 }}
          >
            <Image
              src={getCharacterBgPath(profile.codename)}
              alt=""
              fill
              className="object-cover opacity-20"
              sizes="100vw"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/50 via-transparent to-surface/50" />

          <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.15)_3px,rgba(255,255,255,0.15)_6px)]" />

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/40 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              animate={reducedMotion ? undefined : { y: [0, 600, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -30 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <CharacterPortrait profile={profile} size="xl" animate />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={profile.id + '-info'}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-center mt-8 space-y-3"
              >
                <motion.h2
                  className="font-heading text-3xl tracking-[0.2em] text-primary"
                  animate={reducedMotion ? undefined : {
                    textShadow: [
                      '0 0 10px var(--color-primary)',
                      '0 0 20px var(--color-primary)',
                      '0 0 10px var(--color-primary)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {profile.codename?.toUpperCase() ?? 'OPERATOR'}
                </motion.h2>

                <p className="font-data-mono text-sm text-on-surface-muted tracking-wider">
                  {profile.full_name}
                </p>

                <p className="font-data-mono text-xs text-on-surface-muted/70">{profile.rank}</p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className={cn(
                    'inline-block px-3 py-1 rounded border font-data-mono text-[10px] tracking-[0.15em]',
                    ROLE_STYLES[profile.role].border,
                    ROLE_STYLES[profile.role].bg,
                    ROLE_STYLES[profile.role].text,
                  )}>
                    {ROLE_LABELS[profile.role]}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 pt-3 font-data-mono text-[10px] text-on-surface-muted/50">
                  <span>ID: {profile.id.slice(0, 8).toUpperCase()}</span>
                  <span>•</span>
                  <span>JOINED: {new Date(profile.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-on-surface-muted/15 rounded-xl bg-surface/30">
          <motion.div
            className="text-center space-y-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-20 h-20 mx-auto border-2 border-dashed border-primary/30 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border border-primary/40 rounded" />
            </div>
            <div>
              <p className="font-heading text-xl text-on-surface-muted tracking-[0.15em]">PILIH PERSONEL</p>
              <p className="font-data-mono text-xs text-on-surface-muted/60 mt-1">Klik kartu di sebelah kiri</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
