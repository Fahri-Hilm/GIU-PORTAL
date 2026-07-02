'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search as SearchIcon,
  Filter,
  MapPin,
  Pencil,
  Trash2,
  Save,
  Upload,
  X,
  Clock,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useMarkers, useOrganizations, useCreateMarker, useUpdateMarker, useDeleteMarker, useUploadMarkerIcon } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/form';
import { Badge, ThreatBadge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { EmptyState } from '@/components/ui/misc';
import { THREAT_META, MAP_DIMENSIONS, type ThreatLevel } from '@/lib/constants';
import { cn, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import type { MapMarker } from '@/lib/types';

const MARKER_TYPE_LABEL: Record<MapMarker['type'], string> = {
  hq: 'Markas Besar',
  stash: 'Stash House',
  meetup: 'Titik Kumpul',
  incident: 'Insiden',
  asset: 'Aset GIU',
};

export default function MarkersPage() {
  const { data: markers = [], isLoading } = useMarkers();
  const { data: orgs = [] } = useOrganizations();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MapMarker['type'] | 'all'>('all');
  const [threatFilter, setThreatFilter] = useState<ThreatLevel | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return markers.filter((m) => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (threatFilter !== 'all' && m.threat_level !== threatFilter) return false;
      if (search && !m.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [markers, search, typeFilter, threatFilter]);

  const selected = markers.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap opacity-0 animate-fade-slide-up" style={{ animationFillMode: 'forwards' }}>
        <div>
          <p className="font-data-mono text-data-mono text-on-surface-muted">DATABASE PENANDA</p>
          <h1 className="font-display-lg text-display-lg text-on-surface mt-1">Penanda Intelijen</h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-2">
            {markers.length} penanda terdaftar · {markers.filter((m) => m.icon_url).length} pakai ikon kustom
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/map">
            <Button variant="outline"><MapPin className="w-4 h-4" /> BUKA PETA</Button>
          </Link>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> PENANDA BARU
          </Button>
        </div>
      </div>

      <Card className="opacity-0 animate-fade-slide-up stagger-1">
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <SearchIcon className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Cari label penanda..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as MapMarker['type'] | 'all')}>
            <SelectTrigger className="w-48"><Filter className="w-3 h-3 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              {Object.entries(MARKER_TYPE_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={threatFilter} onValueChange={(v) => setThreatFilter(v as ThreatLevel | 'all')}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tingkat</SelectItem>
              {Object.entries(THREAT_META).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
          {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-36 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="Tidak ada penanda"
            description={search || typeFilter !== 'all' || threatFilter !== 'all' ? 'Coba ubah filter.' : 'Tambahkan penanda pertama di peta atau di sini.'}
            action={<Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Tambah Penanda</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
          {filtered.map((m, i) => {
            const org = orgs.find((o) => o.id === m.organization_id);
            const meta = THREAT_META[m.threat_level];
            return (
              <Card
                key={m.id}
                className="opacity-0 animate-fade-slide-up group cursor-pointer hover:border-primary/40 transition-smooth relative overflow-hidden"
                style={{ animationDelay: `${0.05 + i * 0.03}s`, animationFillMode: 'forwards' }}
                onClick={() => setSelectedId(m.id)}
              >
                <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: meta.color }} />
                <CardHeader className="flex-row items-start gap-3 relative z-10">
                  <div
                    className="w-11 h-11 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0"
                    style={{
                      borderColor: `color-mix(in srgb, ${meta.color} 50%, transparent)`,
                      background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
                      boxShadow: m.threat_level === 'critical' ? `0 0 12px ${meta.color}40` : undefined,
                    }}
                  >
                    {m.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.icon_url} alt={m.label} className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-5 h-5" style={{ color: meta.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate group-hover:text-primary transition-smooth">{m.label}</CardTitle>
                    <p className="font-data-mono text-data-mono text-on-surface-muted mt-0.5">
                      {MARKER_TYPE_LABEL[m.type]} · ({m.x}, {m.y})
                    </p>
                  </div>
                  <ThreatBadge level={m.threat_level} />
                </CardHeader>
                <CardContent className="relative z-10">
                  {org && (
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-3 h-3 text-on-surface-muted" />
                      <span className="font-body-md text-xs text-on-surface-variant truncate">{org.name}</span>
                    </div>
                  )}
                  {m.notes && <p className="font-body-md text-xs text-on-surface-muted line-clamp-1 mb-2">{m.notes}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-border-steel/60">
                    <span className="font-data-mono text-data-mono text-on-surface-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatRelativeTime(m.updated_at)}
                    </span>
                    <span className="font-label-caps text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-smooth flex items-center gap-1">
                      EDIT <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateMarkerDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(id) => { setSelectedId(id); setCreateOpen(false); }} />

      <MarkerEditSheet marker={selected} open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)} />
    </div>
  );
}

function CreateMarkerDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const create = useCreateMarker();
  const { data: orgs = [] } = useOrganizations();
  const [form, setForm] = useState({
    label: '',
    type: 'asset' as MapMarker['type'],
    threat_level: 'medium' as ThreatLevel,
    organization_id: '' as string | null,
    x: 500,
    y: 500,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error('Label wajib diisi');
      return;
    }
    try {
      const m = await create.mutateAsync({
        ...form,
        organization_id: form.organization_id || null,
        notes: form.notes || null,
        icon_url: null,
      });
      toast.success('Penanda dibuat');
      onCreated(m.id);
      setForm({ label: '', type: 'asset', threat_level: 'medium', organization_id: null, x: 500, y: 500, notes: '' });
    } catch (err) {
      toast.error('Gagal membuat penanda', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Penanda Baru</DialogTitle>
          <DialogDescription>Tambah penanda intelijen. Bisa upload ikon setelah disimpan.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Label</Label>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Mis. Markas Ballas" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipe</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MapMarker['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MARKER_TYPE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
          <div>
            <Label>Organisasi Terkait</Label>
            <Select value={form.organization_id ?? 'none'} onValueChange={(v) => setForm({ ...form, organization_id: v === 'none' ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Pilih organisasi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak terkait</SelectItem>
                {orgs.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Koordinat X (0-{MAP_DIMENSIONS.width})</Label>
              <Input type="number" min={0} max={MAP_DIMENSIONS.width} value={form.x} onChange={(e) => setForm({ ...form, x: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Koordinat Y (0-{MAP_DIMENSIONS.height})</Label>
              <Input type="number" min={0} max={MAP_DIMENSIONS.height} value={form.y} onChange={(e) => setForm({ ...form, y: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Catatan</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Observasi..." />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
            <Button type="submit" disabled={create.isPending}><Save className="w-4 h-4" /> {create.isPending ? 'MENYIMPAN...' : 'SIMPAN'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MarkerEditSheet({
  marker,
  open,
  onOpenChange,
}: {
  marker: MapMarker | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const updateMarker = useUpdateMarker();
  const deleteMarker = useDeleteMarker();
  const uploadMarkerIcon = useUploadMarkerIcon();
  const { data: orgs = [] } = useOrganizations();
  const [edit, setEdit] = useState<MapMarker | null>(null);

  useMemo(() => {
    if (marker) setEdit({ ...marker });
  }, [marker]);

  if (!marker || !edit) {
    return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" /></Sheet>;
  }

  const org = orgs.find((o) => o.id === edit.organization_id);

  const handleSave = async () => {
    try {
      await updateMarker.mutateAsync({
        id: edit.id,
        patch: {
          label: edit.label,
          type: edit.type,
          threat_level: edit.threat_level,
          organization_id: edit.organization_id,
          x: edit.x,
          y: edit.y,
          notes: edit.notes,
          icon_url: edit.icon_url,
        },
      });
      toast.success('Penanda disimpan');
      onOpenChange(false);
    } catch (err) {
      toast.error('Gagal menyimpan', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus penanda "${edit.label}"?`)) return;
    await deleteMarker.mutateAsync(edit.id);
    toast.success('Penanda dihapus');
    onOpenChange(false);
  };

  const handleIconUpload = async (file: File) => {
    try {
      const url = await uploadMarkerIcon.mutateAsync({ file, markerId: edit.id });
      setEdit({ ...edit, icon_url: url });
      await updateMarker.mutateAsync({ id: edit.id, patch: { icon_url: url } });
      toast.success('Ikon diunggah');
    } catch (err) {
      toast.error('Gagal upload ikon', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const meta = THREAT_META[edit.threat_level];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="flex-row items-start gap-4">
          <div
            className="w-14 h-14 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0"
            style={{
              borderColor: `color-mix(in srgb, ${meta.color} 50%, transparent)`,
              background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
              boxShadow: edit.threat_level === 'critical' ? `0 0 15px ${meta.color}50` : undefined,
            }}
          >
            {edit.icon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={edit.icon_url} alt={edit.label} className="w-full h-full object-cover" />
            ) : (
              <MapPin className="w-6 h-6" style={{ color: meta.color }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="truncate">{edit.label}</SheetTitle>
            <SheetDescription className="mt-1">
              {MARKER_TYPE_LABEL[edit.type]} · {org?.name ?? 'Standalone'}
            </SheetDescription>
          </div>
          <Button size="iconSm" variant="ghost" onClick={handleDelete} title="Hapus"><Trash2 className="w-4 h-4" /></Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-gutter-md space-y-4">
          <div>
            <Label>Ikon Penanda</Label>
            <div className="flex items-center gap-3 mt-1">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border-steel bg-surface-gunmetal/40 text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-surface-gunmetal transition-smooth font-label-caps text-[10px]">
                  <Upload className="w-3.5 h-3.5" />
                  {edit.icon_url ? 'GANTI IKON' : 'UPLOAD IKON'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleIconUpload(f);
                  }}
                />
              </label>
              {edit.icon_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    setEdit({ ...edit, icon_url: null });
                    await updateMarker.mutateAsync({ id: edit.id, patch: { icon_url: null } });
                    toast.success('Ikon dihapus');
                  }}
                >
                  <X className="w-3.5 h-3.5" /> HAPUS IKON
                </Button>
              )}
            </div>
            {uploadMarkerIcon.isPending && (
              <p className="font-data-mono text-data-mono text-on-surface-muted mt-1.5">Mengunggah...</p>
            )}
            <p className="font-body-md text-xs text-on-surface-muted mt-1.5">
              Ikon tampil sebagai logo kustom di peta (menggantikan shape default). Upload PNG/JPG/WebP kotak, akan otomatis di-crop melingkar.
            </p>
          </div>

          <div>
            <Label>Label</Label>
            <Input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipe</Label>
              <Select value={edit.type} onValueChange={(v) => setEdit({ ...edit, type: v as MapMarker['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MARKER_TYPE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tingkat Ancaman</Label>
              <Select value={edit.threat_level} onValueChange={(v) => setEdit({ ...edit, threat_level: v as ThreatLevel })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(THREAT_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Organisasi Terkait</Label>
            <Select value={edit.organization_id ?? 'none'} onValueChange={(v) => setEdit({ ...edit, organization_id: v === 'none' ? null : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak terkait</SelectItem>
                {orgs.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Koordinat X</Label>
              <Input type="number" min={0} max={MAP_DIMENSIONS.width} value={edit.x} onChange={(e) => setEdit({ ...edit, x: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Koordinat Y</Label>
              <Input type="number" min={0} max={MAP_DIMENSIONS.height} value={edit.y} onChange={(e) => setEdit({ ...edit, y: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Catatan</Label>
            <Textarea value={edit.notes ?? ''} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-border-steel/60">
            <div>
              <p className="font-data-mono text-on-surface-muted">DIBUAT</p>
              <p className="font-body-md text-on-surface mt-0.5">{formatRelativeTime(edit.created_at)}</p>
            </div>
            <div>
              <p className="font-data-mono text-on-surface-muted">DIPERBARUI</p>
              <p className="font-body-md text-on-surface mt-0.5">{formatRelativeTime(edit.updated_at)}</p>
            </div>
          </div>
          <Link
            href="/map"
            className="flex items-center gap-2 p-3 rounded-lg border border-border-steel bg-surface-gunmetal/40 hover:border-primary/40 transition-smooth"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="font-body-md text-sm text-on-surface">Lihat di Peta Intelijen</p>
              <p className="font-data-mono text-data-mono text-on-surface-muted">Koordinat ({edit.x}, {edit.y})</p>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-muted" />
          </Link>
        </div>

        <div className="flex items-center gap-2 p-gutter-md border-t border-border-steel/60">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button className="flex-1" onClick={handleSave} disabled={updateMarker.isPending}>
            <Save className="w-4 h-4" /> SIMPAN
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
