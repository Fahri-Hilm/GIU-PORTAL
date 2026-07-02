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
} from 'lucide-react';
import { motion } from 'motion/react';
import { useProfiles, useCreateProfile, useDeleteProfile } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';
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
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [uploadTarget, setUploadTarget] = useState<Profile | null>(null);

  const filtered = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.rank.toLowerCase().includes(search.toLowerCase()) ||
      (p.codename ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'commander';

  const firstProfile = filtered[0];
  if (!selectedProfile && firstProfile) {
    setSelectedProfile(firstProfile);
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="font-data-mono text-[10px] text-on-surface-muted/60 tracking-[0.2em]">GIU INTELLIGENCE DIVISION</p>
            <h1 className="font-heading text-3xl md:text-4xl tracking-[0.1em]">
              <span className="text-primary">SELECT</span>{' '}
              <span className="text-on-surface">OPERATIVE</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-on-surface-muted/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search operatives..."
                className="pl-9 w-56 bg-surface/50 border-on-surface-muted/20 focus:border-primary/50"
              />
            </div>
            {isAdmin && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">ADD OPERATIVE</span>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <motion.div
            className="flex flex-col items-center gap-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-data-mono text-xs text-on-surface-muted/60 tracking-wider">LOADING OPERATIVES...</p>
          </motion.div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={User}
          title="NO OPERATIVES FOUND"
          description={search ? 'No match for search criteria' : 'No operatives registered'}
        />
      ) : (
        <div className="flex gap-6 h-[calc(100vh-220px)]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-72 lg:w-80 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-track-surface scrollbar-thumb-surface-elevated"
          >
            {filtered.map((profile, i) => (
              <CharacterCard
                key={profile.id}
                profile={profile}
                isSelected={selectedProfile?.id === profile.id}
                onSelect={setSelectedProfile}
                index={i}
                onUploadClick={setUploadTarget}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            <FeaturedCharacter profile={selectedProfile} />
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 pt-4 border-t border-on-surface-muted/10"
      >
        <div className="flex items-center justify-between font-data-mono text-[10px] text-on-surface-muted/50 tracking-wider">
          <div className="flex items-center gap-4">
            <span>TOTAL: {profiles.length}</span>
            <span className="text-primary/50">•</span>
            <span>DISPLAYED: {filtered.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-active" />
              ACTIVE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              COMMANDER
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-threat-critical" />
              ADMIN
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
          <DialogTitle className="font-heading text-lg tracking-wider">NEW OPERATIVE</DialogTitle>
          <DialogDescription className="font-data-mono text-xs text-on-surface-muted/60">
            Register new team member
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-data-mono text-[10px] tracking-wider text-on-surface-muted/70">FULL NAME</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <Label className="font-data-mono text-[10px] tracking-wider text-on-surface-muted/70">CODENAME</Label>
            <Input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} placeholder="Optional" className="font-data-mono tracking-wider" />
          </div>
          <div>
            <Label className="font-data-mono text-[10px] tracking-wider text-on-surface-muted/70">EMAIL</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label className="font-data-mono text-[10px] tracking-wider text-on-surface-muted/70">PASSWORD</Label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted/50 hover:text-on-surface-muted">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-data-mono text-[10px] tracking-wider text-on-surface-muted/70">RANK</Label>
              <Select value={form.rank} onValueChange={(v) => setForm({ ...form, rank: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RANK_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-data-mono text-[10px] tracking-wider text-on-surface-muted/70">ROLE</Label>
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
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline" className="border-on-surface-muted/20">CANCEL</Button></DialogClose>
            <Button type="submit" disabled={create.isPending} className="bg-primary/10 border border-primary/30 text-primary">
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
          <DialogTitle className="font-heading text-lg tracking-wider">REMOVE OPERATIVE</DialogTitle>
          <DialogDescription className="font-data-mono text-xs text-on-surface-muted/60">
            Remove <span className="text-primary">{target.full_name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild><Button variant="outline" className="border-on-surface-muted/20">CANCEL</Button></DialogClose>
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
