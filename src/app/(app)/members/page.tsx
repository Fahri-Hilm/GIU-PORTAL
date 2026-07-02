'use client';

import { useState } from 'react';
import {
  Plus,
  Search as SearchIcon,
  Shield,
  Mail,
  User,
  Trash2,
  Save,
  Loader2,
  Crown,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useProfiles, useCreateProfile, useDeleteProfile } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/misc';
import { CornerBrackets, TacticalFrame } from '@/components/tactical';
import { CharacterCard, FeaturedCharacter, UploadPortraitDialog } from '@/components/character';
import { toast } from 'sonner';
import type { Profile } from '@/lib/types';

const ROLE_META: Record<Profile['role'], { label: string; color: string; icon: typeof Crown }> = {
  admin: { label: 'ADMINISTRATOR', color: 'var(--color-threat-critical)', icon: Crown },
  commander: { label: 'KOMANDAN', color: 'var(--color-primary)', icon: Shield },
  analyst: { label: 'ANALIS', color: 'var(--color-status-active)', icon: User },
};

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
    <div className="p-gutter-md space-y-gutter-md max-w-[1600px] mx-auto h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap opacity-0 animate-fade-slide-up" style={{ animationFillMode: 'forwards' }}>
        <div>
          <p className="font-data-mono text-data-mono text-on-surface-muted">PERSONEL GIU</p>
          <h1 className="font-heading text-2xl md:text-3xl">SELECT OPERATIVE</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari personel..."
              className="pl-9 w-48"
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> ANGGOTA BARU
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={User}
          title="Tidak Ada Personel"
          description={search ? 'Tidak ada yang cocok dengan pencarian' : 'Belum ada anggota terdaftar'}
        />
      ) : (
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="w-1/3 overflow-y-auto pr-2 space-y-2">
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
          </div>

          <div className="flex-1">
            <FeaturedCharacter profile={selectedProfile} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs font-data-mono text-on-surface-muted pt-2 border-t border-on-surface-muted/10">
        <span>TOTAL: {profiles.length}</span>
        <span>•</span>
        <span>ONLINE: {profiles.filter((p) => p.role === 'commander' || p.role === 'admin').length}</span>
      </div>

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
      toast.error('Lengkapi semua field. Password minimal 6 karakter.');
      return;
    }
    try {
      await create.mutateAsync({
        ...form,
        codename: form.codename.trim() || null,
      });
      toast.success('Anggota dibuat', { description: `${form.full_name} dapat login setelah verifikasi email.` });
      onOpenChange(false);
      setForm({ full_name: '', codename: '', email: '', password: '', rank: 'Analyst', role: 'analyst' });
    } catch (err) {
      toast.error('Gagal membuat anggota', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">TAMBAH ANGGOTA</DialogTitle>
          <DialogDescription>Buat akun baru untuk anggota tim</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama Lengkap</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <Label>Nama Sandi (Codename)</Label>
            <Input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} placeholder="Opsional" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pangkat</Label>
              <Select value={form.rank} onValueChange={(v) => setForm({ ...form, rank: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RANK_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
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
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">BATAL</Button></DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              SIMPAN
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
          <DialogTitle className="font-heading text-lg">HAPUS ANGGOTA</DialogTitle>
          <DialogDescription>
            Hapus <strong>{target.full_name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">BATAL</Button></DialogClose>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await deleteProfile.mutateAsync(target.id);
                toast.success('Anggota dihapus');
                onOpenChange();
              } catch {
                toast.error('Gagal menghapus');
              }
            }}
            disabled={deleteProfile.isPending}
          >
            {deleteProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            HAPUS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
