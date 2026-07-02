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
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.03, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(profile)}
      className={cn(
        'group relative cursor-pointer rounded-lg border overflow-hidden transition-all duration-300',
        isSelected
          ? 'border-primary/80 bg-gradient-to-r from-primary/10 via-surface-elevated to-surface-elevated shadow-[0_0_30px_-5px_var(--color-primary)]'
          : 'border-on-surface-muted/15 hover:border-primary/40 hover:bg-surface-elevated/50 bg-surface/30',
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]" />

      {isSelected && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
        </>
      )}

      <div className="relative p-2.5">
        <div className="relative">
          <CharacterPortrait profile={profile} size="sm" animate={isSelected} />

          {isAdmin && onUploadClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUploadClick(profile);
              }}
              className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-surface-elevated/90 border border-on-surface-muted/20 opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:border-primary/40 transition-all duration-200"
            >
              <Camera className="w-3 h-3 text-on-surface-muted group-hover:text-primary" />
            </button>
          )}

          <div className={cn(
            'absolute top-1.5 left-1.5 p-1 rounded-md bg-surface-elevated/90 border border-on-surface-muted/20',
            ROLE_COLORS[profile.role],
          )}>
            <RoleIcon className="w-3 h-3" />
          </div>
        </div>

        <div className="mt-2.5 space-y-1">
          <p className="font-data-mono text-[11px] text-primary tracking-[0.15em] truncate font-medium">
            {profile.codename?.toUpperCase() ?? 'OPERATOR'}
          </p>
          <p className="text-[10px] text-on-surface-muted/80 truncate">{profile.rank}</p>

          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 pt-1"
            >
              <StatusDot color="var(--color-status-active)" pulse />
              <span className="font-data-mono text-[9px] text-status-active tracking-wider">ACTIVE</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className={cn(
        'h-0.5 transition-all duration-300',
        isSelected
          ? 'bg-gradient-to-r from-transparent via-primary to-transparent'
          : 'bg-transparent group-hover:bg-gradient-to-r from-transparent via-primary/30 to-transparent',
      )} />
    </motion.div>
  );
}
