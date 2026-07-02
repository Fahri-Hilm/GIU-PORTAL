'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  Search as SearchIcon,
  Users,
  Building2,
  Pencil,
  Upload,
  Trash2,
  Save,
  MapPin,
  Medal,
  Filter,
  ChevronRight,
  X,
  Calendar,
  Hash,
} from 'lucide-react';
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization, useMissions, useCreateMission, useDeleteMission, useTerritories, useDeleteTerritory, useUploadLogo } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/form';
import { Badge, ThreatBadge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/misc';
import { THREAT_META, type ThreatLevel } from '@/lib/constants';
import { cn, formatRelativeTime, formatDate, initials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';
import type { Organization, Mission } from '@/lib/types';

export default function OrganizationsPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationsContent />
    </Suspense>
  );
}

function OrganizationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: orgs = [], isLoading } = useOrganizations();
  const [search, setSearch] = useState('');
  const [threatFilter, setThreatFilter] = useState<ThreatLevel | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return orgs.filter((o) => {
      if (threatFilter !== 'all' && o.threat_level !== threatFilter) return false;
      if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.alias?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [orgs, search, threatFilter]);

  const selected = orgs.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap opacity-0 animate-fade-slide-up" style={{ animationFillMode: 'forwards' }}>
        <div>
          <p className="font-data-mono text-data-mono text-on-surface-muted">DATABASE ORGANISASI</p>
          <h1 className="font-display-lg text-display-lg text-on-surface mt-1">Organisasi CRM</h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-2">
            {orgs.length} organisasi terdaftar · Kelola profil, ancaman, misi, dan wilayah.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> ORGANISASI BARU
        </Button>
      </div>

      <Card className="opacity-0 animate-fade-slide-up stagger-1">
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <SearchIcon className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cari nama atau alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={threatFilter} onValueChange={(v) => setThreatFilter(v as ThreatLevel | 'all')}>
            <SelectTrigger className="w-48">
              <Filter className="w-3 h-3 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tingkat</SelectItem>
              {Object.entries(THREAT_META).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-44 animate-pulse">
              <CardContent className="opacity-30">
                <div className="h-4 w-24 bg-on-surface-muted rounded mb-3" />
                <div className="h-8 w-32 bg-on-surface-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="Tidak ada organisasi"
            description={search || threatFilter !== 'all' ? 'Coba ubah filter pencarian.' : 'Mulai dengan menambahkan organisasi pertama.'}
            action={!search && threatFilter === 'all' && <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Tambah Organisasi</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
          {filtered.map((org, i) => (
            <OrgCard key={org.id} org={org} index={i} onOpen={() => setSelectedId(org.id)} />
          ))}
        </div>
      )}

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(id) => { setSelectedId(id); setCreateOpen(false); }} />

      <OrganizationDrawer
        org={selected}
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) {
            setSelectedId(null);
            if (searchParams.get('id')) router.replace('/organizations');
          }
        }}
      />
    </div>
  );
}

function OrgCard({ org, index, onOpen }: { org: Organization; index: number; onOpen: () => void }) {
  const meta = THREAT_META[org.threat_level];
  return (
    <Card
      className="opacity-0 animate-fade-slide-up group cursor-pointer hover:border-primary/40 transition-smooth relative overflow-hidden"
      style={{ animationDelay: `${0.05 + index * 0.04}s`, animationFillMode: 'forwards' }}
      onClick={onOpen}
    >
      <div
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ background: org.primary_color }}
      />
      <CardHeader className="flex-row items-start gap-3 relative z-10">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center font-headline-md text-lg shrink-0 overflow-hidden"
          style={{
            background: org.logo_url ? 'transparent' : `color-mix(in srgb, ${org.primary_color} 18%, transparent)`,
            color: org.primary_color,
            border: `1px solid color-mix(in srgb, ${org.primary_color} 40%, transparent)`,
          }}
        >
          {org.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
          ) : (
            initials(org.name)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base truncate">{org.name}</CardTitle>
          <p className="font-data-mono text-data-mono text-on-surface-muted truncate">
            {org.alias ?? '—'} · {org.members_count} anggota
          </p>
        </div>
        <ThreatBadge level={org.threat_level} withPulse={org.threat_level === 'critical'} />
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-3">{org.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-data-mono text-data-mono text-on-surface-muted">
            Diperbarui {formatRelativeTime(org.updated_at)}
          </span>
          <span className="font-label-caps text-label-caps text-primary opacity-0 group-hover:opacity-100 transition-smooth flex items-center gap-1">
            BUKA <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateOrganizationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const create = useCreateOrganization();
  const [form, setForm] = useState({
    name: '',
    alias: '',
    description: '',
    threat_level: 'medium' as ThreatLevel,
    founded_year: new Date().getFullYear(),
    members_count: 0,
    primary_color: '#e6c383',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }
    try {
      const org = await create.mutateAsync({
        ...form,
        alias: form.alias || null,
        founded_year: Number(form.founded_year) || null,
        status: 'active',
        logo_url: null,
      });
      toast.success(`Organisasi "${org.name}" dibuat`);
      onCreated(org.id);
      setForm({ name: '', alias: '', description: '', threat_level: 'medium', founded_year: new Date().getFullYear(), members_count: 0, primary_color: '#e6c383' });
    } catch (err) {
      toast.error('Gagal membuat organisasi', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Organisasi Baru</DialogTitle>
          <DialogDescription>Daftarkan organisasi kriminal baru ke database.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama Organisasi</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mis. Ballas" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Alias</Label>
              <Input value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="Mis. GSF" />
            </div>
            <div>
              <Label>Tahun Berdiri</Label>
              <Input type="number" value={form.founded_year} onChange={(e) => setForm({ ...form, founded_year: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Latar belakang, modus operandi..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tingkat Ancaman</Label>
              <Select value={form.threat_level} onValueChange={(v) => setForm({ ...form, threat_level: v as ThreatLevel })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(THREAT_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jumlah Anggota</Label>
              <Input type="number" value={form.members_count} onChange={(e) => setForm({ ...form, members_count: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Warna Identitas</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-10 rounded border border-border-steel bg-transparent cursor-pointer" />
              <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="font-data-mono" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>
              <Save className="w-4 h-4" /> {create.isPending ? 'MENYIMPAN...' : 'SIMPAN'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrganizationDrawer({
  org,
  open,
  onOpenChange,
}: {
  org: Organization | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const updateOrg = useUpdateOrganization();
  const deleteOrg = useDeleteOrganization();
  const uploadLogo = useUploadLogo();
  const { data: missions = [] } = useMissions(org?.id);
  const { data: territories = [] } = useTerritories();
  const createMission = useCreateMission();
  const deleteMission = useDeleteMission();
  const deleteTerritory = useDeleteTerritory();

  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<Organization | null>(null);

  useEffect(() => {
    if (org) {
      setForm({ ...org });
      setEdit(false);
    }
  }, [org]);

  if (!org || !form) {
    return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" /></Sheet>;
  }

  const orgTerritories = territories.filter((t) => t.organization_id === org.id);

  const handleSave = async () => {
    if (!form) return;
    try {
      await updateOrg.mutateAsync({
        id: form.id,
        patch: {
          name: form.name,
          alias: form.alias,
          description: form.description,
          threat_level: form.threat_level,
          founded_year: form.founded_year,
          members_count: form.members_count,
          status: form.status,
          primary_color: form.primary_color,
        },
      });
      toast.success('Profil disimpan');
      setEdit(false);
    } catch (err) {
      toast.error('Gagal menyimpan', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!org) return;
    try {
      const url = await uploadLogo.mutateAsync({ file, organizationId: org.id });
      await updateOrg.mutateAsync({ id: org.id, patch: { logo_url: url } });
      toast.success('Logo diperbarui');
    } catch (err) {
      toast.error('Gagal upload logo', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const handleDelete = async () => {
    if (!org) return;
    if (!confirm(`Hapus "${org.name}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus misi & wilayah terkait.`)) return;
    await deleteOrg.mutateAsync(org.id);
    toast.success('Organisasi dihapus');
    onOpenChange(false);
  };

  const handleAddMission = async () => {
    if (!org) return;
    try {
      await createMission.mutateAsync({
        organization_id: org.id,
        title: 'Misi Baru',
        description: '',
        status: 'planning',
        objective: '',
      });
      toast.success('Misi ditambahkan');
    } catch (err) {
      toast.error('Gagal menambah misi');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="flex-row items-start gap-4">
          <div className="relative group">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center font-headline-md text-xl overflow-hidden shrink-0 border"
              style={{
                background: form.logo_url ? 'transparent' : `color-mix(in srgb, ${form.primary_color} 18%, transparent)`,
                color: form.primary_color,
                borderColor: `color-mix(in srgb, ${form.primary_color} 40%, transparent)`,
              }}
            >
              {form.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt={form.name} className="w-full h-full object-cover" />
              ) : (
                initials(form.name)
              )}
            </div>
            {edit && (
              <label className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-smooth cursor-pointer rounded-lg border border-border-steel">
                <Upload className="w-5 h-5 text-primary" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="truncate">{form.name}</SheetTitle>
            <SheetDescription className="flex items-center gap-2 flex-wrap mt-1">
              {form.alias && <Badge variant="outline">{form.alias}</Badge>}
              <ThreatBadge level={form.threat_level} withPulse={form.threat_level === 'critical'} />
              <Badge>{form.status.toUpperCase()}</Badge>
            </SheetDescription>
          </div>
          <div className="flex items-center gap-1">
            {edit ? (
              <>
                <Button size="iconSm" variant="ghost" onClick={() => { setForm({ ...org }); setEdit(false); }}><X className="w-4 h-4" /></Button>
                <Button size="iconSm" onClick={handleSave} disabled={updateOrg.isPending}><Save className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <Button size="iconSm" variant="ghost" onClick={() => setEdit(true)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button size="iconSm" variant="ghost" onClick={handleDelete} title="Hapus"><Trash2 className="w-4 h-4" /></Button>
              </>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-gutter-md border-b border-border-steel/60">
            <TabsList className="mt-2">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="missions">Misi ({missions.length})</TabsTrigger>
              <TabsTrigger value="territories">Wilayah ({orgTerritories.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="flex-1 overflow-y-auto p-gutter-md m-0">
            <div className="space-y-4">
              <div>
                <Label>Deskripsi</Label>
                {edit ? (
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
                ) : (
                  <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{form.description || 'Tidak ada deskripsi.'}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nama</Label>
                  {edit ? (
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  ) : (
                    <p className="font-body-md text-sm text-on-surface">{form.name}</p>
                  )}
                </div>
                <div>
                  <Label>Alias</Label>
                  {edit ? (
                    <Input value={form.alias ?? ''} onChange={(e) => setForm({ ...form, alias: e.target.value })} />
                  ) : (
                    <p className="font-body-md text-sm text-on-surface">{form.alias ?? '—'}</p>
                  )}
                </div>
                <div>
                  <Label>Tingkat Ancaman</Label>
                  {edit ? (
                    <Select value={form.threat_level} onValueChange={(v) => setForm({ ...form, threat_level: v as ThreatLevel })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(THREAT_META).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <ThreatBadge level={form.threat_level} />
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  {edit ? (
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Organization['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="dormant">Dorman</SelectItem>
                        <SelectItem value="dismantled">Dibubarkan</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-body-md text-sm text-on-surface capitalize">{form.status}</p>
                  )}
                </div>
                <div>
                  <Label>Tahun Berdiri</Label>
                  {edit ? (
                    <Input type="number" value={form.founded_year ?? ''} onChange={(e) => setForm({ ...form, founded_year: Number(e.target.value) })} />
                  ) : (
                    <p className="font-body-md text-sm text-on-surface">{form.founded_year ?? '—'}</p>
                  )}
                </div>
                <div>
                  <Label>Jumlah Anggota</Label>
                  {edit ? (
                    <Input type="number" value={form.members_count} onChange={(e) => setForm({ ...form, members_count: Number(e.target.value) })} />
                  ) : (
                    <p className="font-body-md text-sm text-on-surface tabular-nums">{form.members_count.toLocaleString('id-ID')}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Warna Identitas</Label>
                {edit ? (
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-10 rounded border border-border-steel bg-transparent cursor-pointer" />
                    <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="font-data-mono" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-border-steel" style={{ background: form.primary_color }} />
                    <span className="font-data-mono text-data-mono text-on-surface">{form.primary_color}</span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-border-steel/60 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-on-surface-muted" />
                  <span className="font-data-mono text-on-surface-muted">Dibuat {formatDate(org.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3 text-on-surface-muted" />
                  <span className="font-data-mono text-on-surface-muted truncate">{org.id}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="missions" className="flex-1 overflow-y-auto p-gutter-md m-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="font-data-mono text-data-mono text-on-surface-muted">{missions.length} MISI</p>
                <Button size="sm" variant="outline" onClick={handleAddMission} disabled={createMission.isPending}>
                  <Plus className="w-3 h-3" /> MISI BARU
                </Button>
              </div>
              {missions.length === 0 ? (
                <EmptyState icon={Medal} title="Belum ada misi" description="Tambahkan misi untuk organisasi ini." />
              ) : (
                missions.map((m) => (
                  <MissionRow key={m.id} mission={m} onDelete={() => deleteMission.mutate(m.id)} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="territories" className="flex-1 overflow-y-auto p-gutter-md m-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="font-data-mono text-data-mono text-on-surface-muted">{orgTerritories.length} WILAYAH</p>
                <a href="/map">
                  <Button size="sm" variant="outline"><MapPin className="w-3 h-3" /> GAMBAR DI PETA</Button>
                </a>
              </div>
              {orgTerritories.length === 0 ? (
                <EmptyState icon={MapPin} title="Belum ada wilayah" description="Gambar wilayah organisasi di Peta Intelijen." />
              ) : (
                orgTerritories.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-steel bg-surface-gunmetal/30">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-sm text-on-surface truncate">{t.name}</p>
                      <p className="font-data-mono text-data-mono text-on-surface-muted">{t.points.length} titik</p>
                    </div>
                    <Button size="iconSm" variant="ghost" onClick={() => deleteTerritory.mutate(t.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function MissionRow({ mission, onDelete }: { mission: Mission; onDelete: () => void }) {
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(mission.title);
  const statusColor =
    mission.status === 'active' ? 'var(--color-status-active)' : mission.status === 'completed' ? 'var(--color-on-surface-muted)' : mission.status === 'failed' ? 'var(--color-threat-critical)' : 'var(--color-threat-medium)';
  return (
    <div className="p-3 rounded-lg border border-border-steel bg-surface-gunmetal/30">
      <div className="flex items-start gap-3">
        <Medal className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {edit ? (
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" />
          ) : (
            <p className="font-body-md text-sm text-on-surface">{mission.title}</p>
          )}
          <p className="font-data-mono text-data-mono text-on-surface-muted mt-1">{mission.objective || mission.description || 'Tanpa detail'}</p>
        </div>
        <span
          className="font-label-caps text-[9px] px-1.5 py-0.5 rounded border"
          style={{ color: statusColor, borderColor: `color-mix(in srgb, ${statusColor} 40%, transparent)`, background: `color-mix(in srgb, ${statusColor} 12%, transparent)` }}
        >
          {mission.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
