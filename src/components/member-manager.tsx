'use client';

import React, { useState } from 'react';
import { Plus, Users, Trash2, Pencil, Camera, Crown, Shield, User, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { useProfiles, useCreateProfile, useUpdateProfile, useDeleteProfile } from '@/lib/queries';
import { TacticalCard } from '@/components/ui/tactical-card';
import { CharacterPortrait } from '@/components/character';
import { UploadPortraitDialog } from '@/components/character';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/misc';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';
import type { Profile } from '@/lib/types';

const RANK_OPTIONS = ['Captain', 'Lieutenant', 'Sergeant', 'Officer', 'Analyst', 'Specialist'];

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

export function MemberManager() {
  const { data: profiles = [], isLoading } = useProfiles();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [uploadTarget, setUploadTarget] = useState<Profile | null>(null);

  if (!isAdmin) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-headline-md text-base text-on-surface tracking-wide">Manajemen Anggota</h3>
          <span className="font-data-mono text-[10px] text-on-surface-muted/40 tracking-wider">({profiles.length})</span>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary">
          <Plus className="w-4 h-4" /> ANGGOTA BARU
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="h-28" />)}
        </div>
      ) : profiles.length === 0 ? (
        <TacticalCard>
          <EmptyState icon={Users} title="Belum ada anggota" description="Tambahkan anggota pertama tim." />
        </TacticalCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {profiles.map((p) => {
            const RoleIcon = ROLE_ICONS[p.role];
            return (
              <TacticalCard key={p.id} className="group p-3 hover:border-primary/40 transition-smooth">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <CharacterPortrait profile={p} size="sm" animate={false} />
                    <button
                      onClick={() => setUploadTarget(p)}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-md bg-surface-elevated border border-border-steel opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:border-primary/40 transition-all"
                      title="Upload portrait"
                    >
                      <Camera className="w-3 h-3 text-on-surface-muted" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <RoleIcon className={`w-3 h-3 ${ROLE_COLORS[p.role]}`} />
                      <p className="font-data-mono text-[11px] text-primary tracking-[0.1em] truncate font-medium">
                        {p.codename?.toUpperCase() ?? 'OPERATOR'}
                      </p>
                    </div>
                    <p className="font-body-md text-sm text-on-surface truncate mt-0.5">{p.full_name}</p>
                    <p className="font-data-mono text-[9px] text-on-surface-muted/60 tracking-wider uppercase mt-0.5">{p.rank}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Button size="iconSm" variant="ghost" onClick={() => setEditTarget(p)} title="Edit">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="iconSm" variant="ghost" onClick={() => setDeleteTarget(p)} title="Hapus" className="hover:text-threat-critical">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TacticalCard>
            );
          })}
        </div>
      )}

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditDialog target={editTarget} onOpenChange={() => setEditTarget(null)} />
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
    full_name: '', codename: '', email: '', password: '', rank: 'Analyst', role: 'analyst' as Profile['role'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || form.password.length < 6) {
      toast.error('Lengkapi semua field. Password minimal 6 karakter.');
      return;
    }
    try {
      await create.mutateAsync({ ...form, codename: form.codename.trim() || null });
      toast.success('Anggota dibuat', { description: `${form.full_name} dapat login setelah verifikasi email.` });
      onOpenChange(false);
      setForm({ full_name: '', codename: '', email: '', password: '', rank: 'Analyst', role: 'analyst' });
    } catch (err) {
      toast.error('Gagal membuat anggota', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg tracking-[0.15em]">ANGGOTA BARU</DialogTitle>
          <DialogDescription className="font-data-mono text-[10px] text-on-surface-muted/50 tracking-wider">
            Daftarkan anggota tim baru
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Nama Lengkap</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Codename</Label>
            <Input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} placeholder="Opsional" className="font-data-mono tracking-[0.1em]" />
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
              <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Pangkat</Label>
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
            <DialogClose asChild><Button variant="outline" className="border-on-surface-muted/15 hover:bg-surface-elevated/50">BATAL</Button></DialogClose>
            <Button type="submit" disabled={create.isPending} className="bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary">
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              DAFTAR
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ target, onOpenChange }: { target: Profile | null; onOpenChange: () => void }) {
  const update = useUpdateProfile();
  const [form, setForm] = useState({
    full_name: '', codename: '', rank: 'Analyst', role: 'analyst' as Profile['role'],
  });

  React.useEffect(() => {
    if (target) {
      setForm({
        full_name: target.full_name,
        codename: target.codename ?? '',
        rank: target.rank,
        role: target.role,
      });
    }
  }, [target]);

  if (!target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        id: target.id,
        full_name: form.full_name,
        codename: form.codename.trim() || null,
        rank: form.rank,
        role: form.role,
      });
      toast.success('Anggota diperbarui', { description: form.full_name });
      onOpenChange();
    } catch (err) {
      toast.error('Gagal memperbarui', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg tracking-[0.15em]">EDIT ANGGOTA</DialogTitle>
          <DialogDescription className="font-data-mono text-[10px] text-on-surface-muted/50 tracking-wider">
            Perbarui informasi {target.full_name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Nama Lengkap</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Codename</Label>
            <Input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} className="font-data-mono tracking-[0.1em]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-data-mono text-[9px] tracking-[0.15em] text-on-surface-muted/50 uppercase">Pangkat</Label>
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
            <DialogClose asChild><Button variant="outline" className="border-on-surface-muted/15 hover:bg-surface-elevated/50">BATAL</Button></DialogClose>
            <Button type="submit" disabled={update.isPending} className="bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary">
              {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              SIMPAN
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ target, onOpenChange }: { target: Profile | null; onOpenChange: () => void }) {
  const del = useDeleteProfile();
  if (!target) return null;

  const handleDelete = async () => {
    try {
      await del.mutateAsync(target.id);
      toast.success('Anggota dihapus', { description: target.full_name });
      onOpenChange();
    } catch (err) {
      toast.error('Gagal menghapus', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg tracking-[0.15em] text-threat-critical">HAPUS ANGGOTA</DialogTitle>
          <DialogDescription className="font-data-mono text-[10px] text-on-surface-muted/50 tracking-wider">
            Yakin menghapus <span className="text-on-surface">{target.full_name}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="p-3 rounded-lg border border-threat-critical/30 bg-threat-critical/5">
          <p className="font-body-md text-xs text-on-surface-variant">
            Tindakan ini tidak dapat dibatalkan. Akun dan data anggota akan dihapus permanen.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild><Button variant="outline" className="border-on-surface-muted/15 hover:bg-surface-elevated/50">BATAL</Button></DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
            {del.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            HAPUS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
