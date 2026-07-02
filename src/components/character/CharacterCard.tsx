'use client';

import { motion } from 'motion/react';
import { Camera, Shield, Crown, User } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';
import { StatusDot } from '@/components/tactical';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/types';

const ROLE_ICONS: Record<Profile['role'], typeof Crown> = {
  admin: Crown,
  commander: Shield,
  analyst: User,
};

const ROLE_COLORS: Record<Profile['role'], string> = {
  admin: 'text-threat-critical',
  commander: 'text-primary',
  analyst: 'text-status-active',
};

interface CharacterCardProps {
  profile: Profile;
  isSelected: boolean;
  onSelect: (profile: Profile) => void;
  index: number;
  onUploadClick?: (profile: Profile) => void;
}

export function CharacterCard({ profile, isSelected, onSelect, index, onUploadClick }: CharacterCardProps) {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';
  const RoleIcon = ROLE_ICONS[profile.role];

  return (
    <motion.div
      initial={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.02, x: 6 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(profile)}
      className={cn(
        'group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-500',
        isSelected
          ? 'bg-gradient-to-r from-primary/8 via-surface-elevated to-surface-elevated'
          : 'bg-surface/40 hover:bg-surface-elevated/60',
      )}
    >
      <div className="absolute inset-0 noise-overlay opacity-30 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)] pointer-events-none" />

      <div
        className={cn(
          'absolute inset-0 border transition-all duration-500 pointer-events-none rounded-lg',
          isSelected
            ? 'border-primary/40 animate-border-pulse'
            : 'border-on-surface-muted/10 group-hover:border-primary/20',
        )}
      />

      {isSelected && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/60 pointer-events-none" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/60 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/60 pointer-events-none" />
        </>
      )}

      <div className="absolute inset-0 diagonal-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative p-3">
        <div className="relative">
          <CharacterPortrait profile={profile} size="sm" animate={isSelected} />

          {isAdmin && onUploadClick && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => {
                e.stopPropagation();
                onUploadClick(profile);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-surface-elevated/90 border border-on-surface-muted/20 opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300"
            >
              <Camera className="w-3 h-3 text-on-surface-muted group-hover:text-primary" />
            </motion.button>
          )}

          <div className={cn(
            'absolute top-2 left-2 p-1.5 rounded-md bg-surface-elevated/90 border border-on-surface-muted/20',
            ROLE_COLORS[profile.role],
          )}>
            <RoleIcon className="w-3 h-3" />
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <p className="font-data-mono text-[11px] text-primary tracking-[0.15em] truncate font-medium">
              {profile.codename?.toUpperCase() ?? 'OPERATOR'}
            </p>
            {isSelected && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                className="overflow-hidden"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </motion.div>
            )}
          </div>

          <p className="font-label-caps text-[9px] text-on-surface-muted/60 tracking-[0.12em] truncate uppercase">
            {profile.rank}
          </p>

          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center gap-1.5 pt-1"
            >
              <StatusDot color="var(--color-status-active)" pulse />
              <span className="font-data-mono text-[9px] text-status-active tracking-wider">ACTIVE</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className={cn(
        'h-[2px] transition-all duration-700',
        isSelected
          ? 'bg-gradient-to-r from-transparent via-primary to-transparent'
          : 'bg-transparent group-hover:bg-gradient-to-r from-transparent via-primary/20 to-transparent',
      )} />
    </motion.div>
  );
}
