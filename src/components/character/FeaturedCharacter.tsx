'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: 'ACTIVE', color: 'var(--color-status-active)' },
  standby: { label: 'STANDBY', color: 'var(--color-status-pending)' },
  deployed: { label: 'DEPLOYED', color: 'var(--color-primary)' },
  offline: { label: 'OFFLINE', color: 'var(--color-on-surface-muted)' },
};

const QUOTES = [
  'Victory through superior firepower.',
  'Knowledge is the ultimate weapon.',
  'In silence, we strike.',
  'Vigilance is the price of freedom.',
  'Strength through discipline.',
  'First to know, first to act.',
];

const SPECIALIZATIONS = ['RECON', 'COMBAT', 'INTEL', 'TECH', 'SNIPER', 'MEDIC'];

interface FeaturedCharacterProps {
  profile: Profile | null;
  className?: string;
}

export function FeaturedCharacter({ profile, className }: FeaturedCharacterProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [displayCodename, setDisplayCodename] = useState('');
  const reducedMotion = useReducedMotion();
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, [reducedMotion]);

  useEffect(() => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    if (!profile?.codename) {
      setDisplayCodename('OPERATOR');
      return;
    }
    if (reducedMotion) {
      setDisplayCodename(profile.codename.toUpperCase());
      return;
    }
    const target = profile.codename.toUpperCase();
    let i = 0;
    setDisplayCodename('');
    const type = () => {
      if (i <= target.length) {
        setDisplayCodename(target.slice(0, i));
        i++;
        typewriterRef.current = setTimeout(type, 60);
      }
    };
    type();
    return () => { if (typewriterRef.current) clearTimeout(typewriterRef.current); };
  }, [profile?.id, profile?.codename, reducedMotion]);

  const status = profile?.status ?? 'active';
  const statusMeta = STATUS_META[status] ?? STATUS_META.active;
  const missionCount = profile?.mission_count ?? Math.floor(Math.random() * 50) + 10;
  const clearanceLevel = profile?.role === 'admin' ? 5 : profile?.role === 'commander' ? 4 : 3;
  const specs = profile?.specialization ?? SPECIALIZATIONS.slice(0, 2);
  const joinDate = profile ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const quote = QUOTES[profile ? profile.id.charCodeAt(0) % QUOTES.length : 0];

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

          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle at 30% 50%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 50%), radial-gradient(circle at 70% 50%, color-mix(in srgb, var(--color-status-active) 6%, transparent), transparent 50%)',
              animation: reducedMotion ? 'none' : 'mesh-drift 12s ease-in-out infinite alternate',
            }}
          />
          <style>{`
            @keyframes mesh-drift {
              0% { transform: translate(0, 0) scale(1); }
              100% { transform: translate(-20px, 10px) scale(1.05); }
            }
            @keyframes radar-sweep-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes scan-down {
              0% { top: -10%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 110%; opacity: 0; }
            }
          `}</style>

          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/40 via-transparent to-surface/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/80" />

          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]"
            style={{ transform: 'rotate(-25deg)' }}
          >
            <span className="font-data-mono text-5xl md:text-7xl font-bold tracking-[0.3em] text-primary whitespace-nowrap">
              KLASIFIKASI RAHASIA
            </span>
          </div>

          <div className="absolute top-4 right-4 w-32 h-32 pointer-events-none opacity-30">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--color-primary) 30%, transparent) 60deg, transparent 90deg)',
                animation: reducedMotion ? 'none' : 'radar-sweep-rotate 4s linear infinite',
              }}
            />
            <div className="absolute inset-2 rounded-full border border-primary/20" />
            <div className="absolute inset-6 rounded-full border border-primary/10" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>

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

          <AnimatePresence>
            <motion.div
              key={profile.id + '-scan'}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none z-20"
              initial={{ top: '-5%', opacity: 0 }}
              animate={{ top: ['−5%', '105%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.6, ease: 'linear' }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>

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
                  {displayCodename || 'OPERATOR'}
                  <span className={cn('inline-block w-[3px] h-8 md:h-10 ml-2 animate-blink align-middle', ROLE_STYLES[profile.role].text)} />
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

                <p className="font-body-md text-xs text-on-surface-muted/60 italic max-w-md mx-auto pt-2">
                  &ldquo;{quote}&rdquo;
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-3 pt-6 max-w-2xl mx-auto"
                >
                  <StatTile label="STATUS" value={statusMeta.label} color={statusMeta.color} pulse={status === 'active'} />
                  <StatTile label="MISSIONS" value={String(missionCount)} color="var(--color-primary)" />
                  <StatTile label="JOINED" value={joinDate} color="var(--color-on-surface-muted)" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-5 max-w-2xl mx-auto space-y-3"
                >
                  <div className="flex items-center justify-between font-data-mono text-[9px] text-on-surface-muted/50 tracking-wider">
                    <span>CLEARANCE LEVEL</span>
                    <span className="text-primary">LV.{clearanceLevel}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 h-1.5 rounded-full transition-all',
                          i < clearanceLevel ? 'bg-primary' : 'bg-surface-elevated/40',
                        )}
                        style={i < clearanceLevel ? { boxShadow: '0 0 8px var(--color-primary)' } : undefined}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    {specs.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-0.5 rounded border border-primary/20 bg-primary/5 font-data-mono text-[9px] text-primary/70 tracking-wider"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-5 pt-4 font-data-mono text-[10px] text-on-surface-muted/40 tracking-wider"
                >
                  <span>ID: {profile.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-primary/30">|</span>
                  <span>JOINED: {joinDate}</span>
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
                NO OPERATIVE SELECTED
              </p>
              <div className="flex items-center justify-center gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-primary/40"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, color, pulse }: { label: string; value: string; color: string; pulse?: boolean }) {
  return (
    <div className="relative p-2.5 rounded-md border border-border-steel/40 bg-surface/40 backdrop-blur-sm">
      <p className="font-data-mono text-[8px] text-on-surface-muted/50 tracking-widest uppercase">{label}</p>
      <p className="font-data-mono text-sm mt-1 tracking-wider flex items-center gap-1.5" style={{ color }}>
        {pulse && (
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
        )}
        {value}
      </p>
    </div>
  );
}
