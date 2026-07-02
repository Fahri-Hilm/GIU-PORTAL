'use client';

import { motion } from 'motion/react';
import { Camera } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';
import { StatusDot } from '@/components/tactical';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/types';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => onSelect(profile)}
      className={cn(
        'relative cursor-pointer rounded-lg border p-2 transition-all duration-200',
        isSelected
          ? 'border-primary shadow-[0_0_15px_var(--color-primary)] bg-surface-elevated'
          : 'border-on-surface-muted/20 hover:border-primary/50 bg-surface/50',
      )}
    >
      <div className="relative">
        <CharacterPortrait profile={profile} size="sm" animate={isSelected} />
        {isAdmin && onUploadClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUploadClick(profile);
            }}
            className="absolute top-1 right-1 p-1 rounded-full bg-surface-elevated/80 opacity-0 group-hover:opacity-100 hover:bg-primary/20 transition-opacity"
          >
            <Camera className="w-3 h-3 text-on-surface-muted" />
          </button>
        )}
      </div>

      <div className="mt-2 space-y-0.5">
        <p className="font-data-mono text-[11px] text-primary tracking-wider truncate">
          {profile.codename?.toUpperCase() ?? 'OPERATOR'}
        </p>
        <p className="text-[10px] text-on-surface-muted truncate">{profile.rank}</p>
        {isSelected && (
          <div className="flex items-center gap-1 pt-0.5">
            <StatusDot color="var(--color-status-active)" />
            <span className="font-data-mono text-[9px] text-status-active">ACTIVE</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
