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
  ChevronRight,
  Crown,
  Eye,
  EyeOff,
  Lock,
  Clock,
} from 'lucide-react';
import { useProfiles, useCreateProfile, useDeleteProfile } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/misc';
import { CornerBrackets, TacticalFrame, StatusDot } from '@/components/tactical';
import { formatRelativeTime, formatDate, initials } from '@/lib/utils';
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

  const filtered = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.rank.toLowerCase().includes(search.toLowerCase()),
  );

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'commander';

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap opacity-0 animate-fade-slide-up" style={{ animationFillMode: 'forwards' }}>
        <div>
          <p className="font-data-mono text-data-mono text-on-surface-muted">PERSONEL GIU</p>
          <h1 className="font-display-lg text-display-lg text-on-surface mt-1">Anggota Tim</h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-2">
            {profiles.length} operator terdaftar · {profiles.filter((p) => p.role === 'commander' || p.role === 'admin').length} dengan akses komando
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> ANGGOTA BARU
          </Button>
        )}
      </div>

      <Card className="opacity-0 animate-fade-slide-up stagger-1">
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <SearchIcon className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Cari nama, email, atau pangkat..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2 font-data-mono text-[10px] text-on-surface-muted">
            <StatusDot color="var(--color-status-active)" size={5} />
            SEMUA OPERATOR AKTIF
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Shield}
            title="Belum ada anggota"
            description={search ? 'Coba ubah pencarian.' : 'Tambahkan operator pertama ke tim GIU.'}
            action={isAdmin && !search ? <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Tambah Anggota</Button> : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
          {filtered.map((p, i) => {
            const roleMeta = ROLE_META[p.role];
            const isSelf = p.id === currentUser?.id;
            return (
              <Card
                key={p.id}
                className="opacity-0 animate-fade-slide-up group relative overflow-hidden"
                style={{ animationDelay: `${0.05 + i * 0.04}s`, animationFillMode: 'forwards' }}
              >
                <CornerBrackets size={10} className="opacity-30 group-hover:opacity-60 transition-opacity" />
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-headline-md text-base overflow-hidden border"
                        style={{
                          color: roleMeta.color,
                          borderColor: `color-mix(in srgb, ${roleMeta.color} 40%, transparent)`,
                          background: `color-mix(in srgb, ${roleMeta.color} 12%, transparent)`,
                        }}
                      >
                        {p.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                        ) : (
                          initials(p.full_name)
                        )}
                      </div>
                      {(p.role === 'admin' || p.role === 'commander') && (
                        <div
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: roleMeta.color }}
                        >
                          <roleMeta.icon className="w-2.5 h-2.5 text-on-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="truncate">{p.full_name}</span>
                        {isSelf && <Badge variant="outline" className="text-[9px] px-1.5 py-0">ANDA</Badge>}
                      </CardTitle>
                      <p className="font-data-mono text-data-mono text-on-surface-muted truncate mt-0.5">{p.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-data-mono text-[9px] text-on-surface-muted uppercase tracking-wider">Pangkat</p>
                      <p className="font-body-md text-sm text-on-surface mt-0.5">{p.rank}</p>
                    </div>
                    <div>
                      <p className="font-data-mono text-[9px] text-on-surface-muted uppercase tracking-wider">Bergabung</p>
                      <p className="font-body-md text-sm text-on-surface mt-0.5">{formatRelativeTime(p.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-steel/60">
                    <span
                      className="font-label-caps text-[9px] px-2 py-0.5 rounded border tracking-wider"
                      style={{
                        color: roleMeta.color,
                        borderColor: `color-mix(in srgb, ${roleMeta.color} 40%, transparent)`,
                        background: `color-mix(in srgb, ${roleMeta.color} 10%, transparent)`,
                      }}
                    >
                      {roleMeta.label}
                    </span>
                    {isAdmin && !isSelf && (
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => setDeleteTarget(p)}
                        title="Hapus anggota"
                        className="text-on-surface-muted hover:text-threat-critical"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DeleteMemberDialog member={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}

function CreateMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const create = useCreateProfile();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    rank: 'Analyst',
    role: 'analyst' as Profile['role'],
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || form.password.length < 6) {
      toast.error('Lengkapi semua field. Password minimal 6 karakter.');
      return;
    }
    try {
      await create.mutateAsync(form);
      toast.success('Anggota dibuat', { description: `${form.full_name} dapat login setelah verifikasi email.` });
      onOpenChange(false);
      setForm({ full_name: '', email: '', password: '', rank: 'Analyst', role: 'analyst' });
    } catch (err) {
      toast.error('Gagal membuat anggota', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Anggota Baru</DialogTitle>
          <DialogDescription>
            Operator baru akan menerima email verifikasi dari Supabase. Setelah verifikasi, mereka bisa login.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama Lengkap</Label>
            <div className="relative">
              <User className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Mis. Sgt. M. Oka"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="operator@gmail.com"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div>
            <Label>Kode Akses (min. 6 karakter)</Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="pl-9 pr-9"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-primary transition-smooth cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pangkat</Label>
              <Select value={form.rank} onValueChange={(v) => setForm({ ...form, rank: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RANK_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Peran</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Profile['role'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyst">Analis</SelectItem>
                  <SelectItem value="commander">Komandan</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> MEMBUAT...</>
              ) : (
                <><Save className="w-4 h-4" /> BUAT ANGGOTA</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteMemberDialog({ member, onClose }: { member: Profile | null; onClose: () => void }) {
  const del = useDeleteProfile();
  if (!member) return null;
  const handleDelete = async () => {
    try {
      await del.mutateAsync(member.id);
      toast.success(`Anggota "${member.full_name}" dihapus`);
      onClose();
    } catch (err) {
      toast.error('Gagal menghapus', { description: err instanceof Error ? err.message : undefined });
    }
  };
  return (
    <Dialog open={!!member} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-threat-critical">Hapus Anggota</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Akun <strong className="text-on-surface">{member.full_name}</strong> ({member.email})
            akan dihapus permanen dari sistem.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
            {del.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            HAPUS PERMANEN
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
