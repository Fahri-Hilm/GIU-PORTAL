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

const ROLE_STYLES: Record<Profile['role'], { border: string; bg: string; text: string; glow: string }> = {
  admin: {
    border: 'border-threat-critical/50',
    bg: 'bg-threat-critical/8',
    text: 'text-threat-critical',
    glow: '0 0 30px -5px var(--color-threat-critical)',
  },
  commander: {
    border: 'border-primary/50',
    bg: 'bg-primary/8',
    text: 'text-primary',
    glow: '0 0 30px -5px var(--color-primary)',
  },
  analyst: {
    border: 'border-status-active/50',
    bg: 'bg-status-active/8',
    text: 'text-status-active',
    glow: '0 0 30px -5px var(--color-status-active)',
  },
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
        'relative h-full min-h-[500px] rounded-xl overflow-hidden noise-overlay scanlines',
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      {profile ? (
        <>
          <div className="absolute inset-0 bg-surface" />

          <motion.div
            className="absolute inset-0"
            animate={reducedMotion ? undefined : { x: mousePos.x * -20, y: mousePos.y * -20 }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          >
            <Image
              src={getCharacterBgPath(profile.codename)}
              alt=""
              fill
              className="object-cover opacity-15"
              sizes="100vw"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/40 via-transparent to-surface/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/80" />

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-primary/30 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-primary/30 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b border-l border-primary/30 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-primary/30 rounded-br-xl" />
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              animate={reducedMotion ? undefined : { y: [-100, 700] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              animate={reducedMotion ? undefined : { y: [-100, 700] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 4 }}
            />
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(color-mix(in srgb, var(--color-primary) 10%, transparent) 1px, transparent 1px),
                  linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 10%, transparent) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.8, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.8, y: -40, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <CharacterPortrait profile={profile} size="xl" animate />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={profile.id + '-info'}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mt-10 space-y-4"
              >
                <motion.h2
                  className={cn(
                    'font-heading text-4xl md:text-5xl tracking-[0.25em]',
                    ROLE_STYLES[profile.role].text,
                  )}
                  animate={reducedMotion ? undefined : {
                    textShadow: [
                      `0 0 20px ${ROLE_STYLES[profile.role].glow}`,
                      `0 0 40px ${ROLE_STYLES[profile.role].glow}`,
                      `0 0 20px ${ROLE_STYLES[profile.role].glow}`,
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {profile.codename?.toUpperCase() ?? 'OPERATOR'}
                </motion.h2>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
                  <p className="font-data-mono text-sm text-on-surface-muted tracking-[0.1em]">
                    {profile.full_name}
                  </p>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
                </div>

                <p className="font-label-caps text-xs text-on-surface-muted/50 tracking-[0.15em] uppercase">
                  {profile.rank}
                </p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <span className={cn(
                    'inline-block px-4 py-1.5 rounded border font-data-mono text-[10px] tracking-[0.2em] uppercase',
                    ROLE_STYLES[profile.role].border,
                    ROLE_STYLES[profile.role].bg,
                    ROLE_STYLES[profile.role].text,
                  )}>
                    {ROLE_LABELS[profile.role]}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-5 pt-4 font-data-mono text-[10px] text-on-surface-muted/40 tracking-wider"
                >
                  <span>ID: {profile.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-primary/30">|</span>
                  <span>JOINED: {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-on-surface-muted/10 rounded-xl bg-surface/20">
          <motion.div
            className="text-center space-y-6"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                className="absolute inset-0 border border-dashed border-primary/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 border border-primary/10 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border border-primary/30 rotate-45" />
              </div>
            </div>

            <div>
              <p className="font-heading text-xl text-on-surface-muted/60 tracking-[0.2em] uppercase">
                Select Operative
              </p>
              <p className="font-data-mono text-[10px] text-on-surface-muted/30 mt-2 tracking-wider">
                CHOOSE FROM ROSTER
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
