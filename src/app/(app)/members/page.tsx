'use client';

import { useState } from 'react';
import {
  Plus,
  Search as SearchIcon,
  Shield,
  User,
  Trash2,
  Save,
  Loader2,
  Crown,
  Eye,
  EyeOff,
  Activity,
  Users,
  Zap,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useProfiles, useCreateProfile, useDeleteProfile } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/misc';
import { CharacterCard, FeaturedCharacter, UploadPortraitDialog } from '@/components/character';
import { toast } from 'sonner';
import type { Profile } from '@/lib/types';

const RANK_OPTIONS = ['Captain', 'Lieutenant', 'Sergeant', 'Officer', 'Analyst', 'Specialist'];

export default function MembersPage() {
  const { data: profiles = [], isLoading } = useProfiles();
  const currentUser = useAuthStore((s) => s.user);
  const reducedMotion = useReducedMotion();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Profile['role'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rank' | 'recent'>('recent');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [uploadTarget, setUploadTarget] = useState<Profile | null>(null);

  const filtered = profiles
    .filter((p) => {
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      const q = search.toLowerCase();
      return (
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.rank.toLowerCase().includes(q) ||
        (p.codename ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'rank') return a.rank.localeCompare(b.rank);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'commander';

  const firstProfile = filtered[0];
  if (!selectedProfile && firstProfile) {
    setSelectedProfile(firstProfile);
  }

  const grouped: { label: string; items: Profile[] }[] = [
    { label: 'KOMANDO', items: filtered.filter((p) => p.role === 'admin' || p.role === 'commander') },
    { label: 'ANALIS', items: filtered.filter((p) => p.role === 'analyst') },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="relative min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(color-mix(in srgb, var(--color-primary) 5%, transparent) 1px, transparent 1px),
              linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 5%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: -30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: reducedMotion ? 'none' : 'blur(0px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-10"
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-2">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.2, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 border border-primary/30 rounded-lg flex items-center justify-center bg-primary/5">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-status-active"
                  animate={reducedMotion ? { scale: 1 } : { scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: reducedMotion ? 0 : Infinity }}
                />
              </div>
              <div>
                <p className="font-data-mono text-[9px] text-on-surface-muted/40 tracking-[0.25em] uppercase">
                  GIU Intelligence Division
                </p>
                <p className="font-data-mono text-[9px] text-on-surface-muted/30 tracking-[0.2em]">
                  OPERATIVE ROSTER v2.0
                </p>
              </div>
            </motion.div>

            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.3, duration: 0.6 }}
              className="font-heading text-4xl md:text-5xl tracking-[0.15em]"
            >
              <span className="text-primary">SELECT</span>
              <span className="text-on-surface/80"> OPERATIVE</span>
            </motion.h1>

            <motion.div
              initial={reducedMotion ? false : { width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: reducedMotion ? 0 : 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1px] bg-gradient-to-r from-primary/60 via-primary/20 to-transparent max-w-md"
            />
          </div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.4, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="relative group">
              <SearchIcon className="w-4 h-4 text-on-surface-muted/30 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary/50 transition-colors" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search operatives..."
                className="pl-9 w-64 bg-surface/30 border-on-surface-muted/10 focus:border-primary/40 focus:bg-surface/50 transition-all duration-300"
              />
            </div>
            {isAdmin && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary/8 border border-primary/20 hover:bg-primary/15 hover:border-primary/40 text-primary transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline font-label-caps text-[10px] tracking-[0.1em]">ADD</span>
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reducedMotion ? 0 : 0.6, duration: 0.4 }}
        className="flex items-center gap-3 flex-wrap mb-2"
      >
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface/40 border border-border-steel/40">
          {(['all', 'admin', 'commander', 'analyst'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-3 py-1 rounded-md font-data-mono text-[10px] tracking-wider uppercase transition-all',
                roleFilter === r
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-on-surface-muted/50 hover:text-on-surface-muted hover:bg-surface-elevated/40 border border-transparent',
              )}
            >
              {r === 'all' ? 'ALL' : r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-data-mono text-[9px] text-on-surface-muted/40 tracking-widest uppercase">SORT</span>
          {(['recent', 'name', 'rank'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                'px-2.5 py-1 rounded-md font-data-mono text-[10px] tracking-wider uppercase transition-all',
                sortBy === s
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-on-surface-muted/50 hover:text-on-surface-muted border border-transparent',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <motion.div
            className="flex flex-col items-center gap-6"
            animate={reducedMotion ? { opacity: 1 } : { opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: reducedMotion ? 0 : Infinity }}
          >
            <div className="relative">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border border-primary/20 rounded-full animate-ping" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-data-mono text-xs text-on-surface-muted/50 tracking-[0.2em]">LOADING</p>
              <p className="font-data-mono text-[10px] text-on-surface-muted/30 tracking-wider">OPERATIVE DATABASE</p>
            </div>
          </motion.div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
          <div className="relative w-32 h-32">
            <motion.div
              className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-lg"
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-12 h-12 text-primary/20" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="font-heading text-2xl text-on-surface-muted/60 tracking-[0.2em] uppercase">
              NO OPERATIVES FOUND
            </p>
            <p className="font-data-mono text-[10px] text-on-surface-muted/40 tracking-wider">
              {search ? 'NO MATCH FOR SEARCH CRITERIA' : 'NO OPERATIVES REGISTERED'}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex gap-8 h-[calc(100vh-280px)]">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -50, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: reducedMotion ? 'none' : 'blur(0px)' }}
            transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.2 }}
            className="w-72 lg:w-80 overflow-y-auto pr-3 space-y-4 scrollbar-thin scrollbar-track-surface/50 scrollbar-thumb-surface-elevated/50"
          >
            {grouped.map((group) => (
              <div key={group.label} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="font-data-mono text-[9px] text-on-surface-muted/40 tracking-widest uppercase">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border-steel/30" />
                  <span className="font-data-mono text-[9px] text-on-surface-muted/30 tracking-wider">
                    {group.items.length}
                  </span>
                </div>
                {group.items.map((profile, i) => (
                  <CharacterCard
                    key={profile.id}
                    profile={profile}
                    isSelected={selectedProfile?.id === profile.id}
                    onSelect={setSelectedProfile}
                    index={i}
                    onUploadClick={setUploadTarget}
                  />
                ))}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: reducedMotion ? 'none' : 'blur(0px)' }}
            transition={{ duration: 0.7, delay: reducedMotion ? 0 : 0.3 }}
            className="flex-1"
          >
            <FeaturedCharacter profile={selectedProfile} />
          </motion.div>
        </div>
      )}

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reducedMotion ? 0 : 0.8, duration: 0.5 }}
        className="relative mt-8 pt-5 border-t border-on-surface-muted/8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 font-data-mono text-[10px] text-on-surface-muted/35 tracking-[0.15em]">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary/40" />
              <span>TOTAL: {profiles.length}</span>
            </div>
            <span className="text-primary/20">|</span>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-status-active/40" />
              <span>DISPLAYED: {filtered.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-5 font-data-mono text-[9px] text-on-surface-muted/25 tracking-[0.12em]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-active/60" />
              <span className="text-on-surface-muted/40">ACTIVE</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="text-on-surface-muted/40">COMMANDER</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-threat-critical/60" />
              <span className="text-on-surface-muted/40">ADMIN</span>
            </span>
          </div>
        </div>
      </motion.div>

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DeleteDialog target={deleteTarget} onOpenChange={() => setDeleteTarget(null)} />
      {uploadTarget && (
        <UploadPortraitDialog
          profile={uploadTarget}
          open={!!uploadTarget}
          onOpenChange={(v) => { if (!v) setUploadTarget(null); }}
        />
      )}
    </div>
  );
}

function CreateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const create = useCreateProfile();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    codename: '',
    email: '',
    password: '',
    rank: 'Analyst',
    role: 'analyst' as Profile['role'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || form.password.length < 6) {
      toast.error('Complete all fields. Password min 6 characters.');
      return;
    }
    try {
      await create.mutateAsync({
        ...form,
        codename: form.codename.trim() || null,
      });
      toast.success('Operative created', { description: `${form.full_name} can login after email verification.` });
      onOpenChange(false);
      setForm({ full_name: '', codename: '', email: '', password: '', rank: 'Analyst', role: 'analyst' });
    } catch (err) {
      toast.error('Failed to create operative', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg tracking-[0.15em]">NEW OPERATIVE</DialogTitle>
          <DialogDescription className="font-data-mono text-[10px] text-on-surface-muted/50 tracking-wider">
            Register new team member
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Full Name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Codename</Label>
            <Input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} placeholder="Optional" className="font-data-mono tracking-[0.1em]" />
          </div>
          <div>
            <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Password</Label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted/30 hover:text-on-surface-muted/60 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Rank</Label>
              <Select value={form.rank} onValueChange={(v) => setForm({ ...form, rank: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RANK_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Profile['role'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="commander">Commander</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild><Button variant="outline" className="border-on-surface-muted/15 hover:bg-surface-elevated/50">CANCEL</Button></DialogClose>
            <Button type="submit" disabled={create.isPending} className="bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary">
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              REGISTER
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ target, onOpenChange }: { target: Profile | null; onOpenChange: () => void }) {
  const deleteProfile = useDeleteProfile();
  if (!target) return null;

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg tracking-[0.15em]">REMOVE OPERATIVE</DialogTitle>
          <DialogDescription className="font-data-mono text-[10px] text-on-surface-muted/50 tracking-wider">
            Remove <span className="text-primary">{target.full_name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild><Button variant="outline" className="border-on-surface-muted/15 hover:bg-surface-elevated/50">CANCEL</Button></DialogClose>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await deleteProfile.mutateAsync(target.id);
                toast.success('Operative removed');
                onOpenChange();
              } catch {
                toast.error('Failed to remove');
              }
            }}
            disabled={deleteProfile.isPending}
          >
            {deleteProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            REMOVE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
