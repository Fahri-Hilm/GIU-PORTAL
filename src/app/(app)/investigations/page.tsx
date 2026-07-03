'use client';

import { useState, useMemo, useRef } from 'react';
import { Plus, Search as SearchIcon, Filter, Search, FileEdit, User, Save, Clock, ChevronRight, Camera, Trash2, MapPin, Loader2 } from 'lucide-react';
import { useInvestigations, useCreateInvestigation, useUpdateInvestigation, useOrganizations, useEvidence, useAddEvidence, useDeleteEvidence, useUploadEvidencePhoto } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TacticalCard } from '@/components/ui/tactical-card';
import { PageHeader } from '@/components/ui/page-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/form';
import { Badge, ThreatBadge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/misc';
import { INVESTIGATION_STATUS_META, INVESTIGATION_STATUS, THREAT_META, type InvestigationStatus, type ThreatLevel } from '@/lib/constants';
import { cn, formatRelativeTime, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Investigation, InvestigationEvidence } from '@/lib/types';

export default function InvestigationsPage() {
  const { data: investigations = [], isLoading } = useInvestigations();
  const { data: orgs = [] } = useOrganizations();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvestigationStatus | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Investigation | null>(null);

  const filtered = useMemo(() => {
    return investigations.filter((i) => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.case_number.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [investigations, search, statusFilter]);

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-[1600px] mx-auto noise-overlay">
      <PageHeader
        label="KASUS INVESTIGASI"
        title="Investigasi"
        icon={Search}
        description={`${investigations.length} kasus tercatat · ${investigations.filter((i) => i.status === 'active').length} aktif`}
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> KASUS BARU</Button>}
      />

      <TacticalCard className="opacity-0 animate-fade-slide-up stagger-1">
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <SearchIcon className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Cari nomor kasus atau judul..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvestigationStatus | 'all')}>
            <SelectTrigger className="w-48"><Filter className="w-3 h-3 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {INVESTIGATION_STATUS.map((s) => (
                <SelectItem key={s} value={s}>{INVESTIGATION_STATUS_META[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </TacticalCard>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-md">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <TacticalCard><EmptyState icon={Search} title="Tidak ada kasus" description="Coba ubah filter atau buat kasus baru." action={<Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Kasus Baru</Button>} /></TacticalCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-md">
          {filtered.map((inv, i) => {
            const org = orgs.find((o) => o.id === inv.organization_id);
            const meta = INVESTIGATION_STATUS_META[inv.status];
            return (
              <TacticalCard
                key={inv.id}
                className="opacity-0 animate-fade-slide-up group cursor-pointer hover:border-primary/40 transition-smooth h-full"
                style={{ animationDelay: `${0.05 + i * 0.04}s`, animationFillMode: 'forwards' }}
                onClick={() => setSelected(inv)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-data-mono text-data-mono text-primary">{inv.case_number}</span>
                    <span className="font-label-caps text-[10px] px-2 py-0.5 rounded border" style={{ color: meta.color, borderColor: `color-mix(in srgb, ${meta.color} 40%, transparent)`, background: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}>
                      {meta.label}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2 group-hover:text-primary transition-smooth">{inv.title}</CardTitle>
                  <p className="font-body-md text-xs text-on-surface-variant line-clamp-2">{inv.summary}</p>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <ThreatBadge level={inv.priority} />
                    {org && <Badge variant="outline">{org.name}</Badge>}
                  </div>
                  <span className="font-data-mono text-data-mono text-on-surface-muted">{formatRelativeTime(inv.updated_at)}</span>
                </CardContent>
              </TacticalCard>
            );
          })}
        </div>
      )}

      <CreateInvestigationDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(inv) => { setSelected(inv); setCreateOpen(false); }} />
      <InvestigationDetailDialog investigation={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function CreateInvestigationDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (inv: Investigation) => void }) {
  const create = useCreateInvestigation();
  const { data: orgs = [] } = useOrganizations();
  const [form, setForm] = useState({
    title: '',
    organization_id: '' as string | null,
    priority: 'medium' as ThreatLevel,
    lead_analyst: '',
    summary: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.lead_analyst.trim()) {
      toast.error('Judul dan analis utama wajib diisi');
      return;
    }
    try {
      const inv = await create.mutateAsync({
        ...form,
        organization_id: form.organization_id || null,
        status: 'active',
      });
      toast.success(`Kasus ${inv.case_number} dibuka`);
      onCreated(inv);
      setForm({ title: '', organization_id: null, priority: 'medium', lead_analyst: '', summary: '' });
    } catch (err) {
      toast.error('Gagal membuat kasus', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buka Kasus Investigasi</DialogTitle>
          <DialogDescription>Nomor kasus akan dibuat otomatis.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Judul Investigasi</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mis. Penetrasi Jaringan Ballas" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Organisasi Terkait</Label>
              <Select value={form.organization_id ?? 'none'} onValueChange={(v) => setForm({ ...form, organization_id: v === 'none' ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Pilih organisasi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak terkait</SelectItem>
                  {orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioritas</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as ThreatLevel })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(THREAT_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Analis Utama</Label>
            <Input value={form.lead_analyst} onChange={(e) => setForm({ ...form, lead_analyst: e.target.value })} placeholder="Mis. Capt. R. Hermawan" required />
          </div>
          <div>
            <Label>Ringkasan</Label>
            <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} placeholder="Latar belakang kasus..." />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
            <Button type="submit" disabled={create.isPending}><Save className="w-4 h-4" /> {create.isPending ? 'MENYIMPAN...' : 'BUKA KASUS'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InvestigationDetailDialog({ investigation, onClose }: { investigation: Investigation | null; onClose: () => void }) {
  const updateInv = useUpdateInvestigation();
  const { data: orgs = [] } = useOrganizations();
  const { data: evidence = [], isLoading: evidenceLoading } = useEvidence(investigation?.id);
  const addEvidence = useAddEvidence();
  const deleteEvidence = useDeleteEvidence();
  const uploadPhoto = useUploadEvidencePhoto();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [evidenceType, setEvidenceType] = useState<InvestigationEvidence['evidence_type']>('surveillance');

  if (!investigation) return null;
  const org = orgs.find((o) => o.id === investigation.organization_id);

  const changeStatus = async (status: InvestigationStatus) => {
    await updateInv.mutateAsync({ id: investigation.id, patch: { status, closed_at: status === 'closed' ? new Date().toISOString() : null } });
    toast.success(`Status diubah ke ${INVESTIGATION_STATUS_META[status].label}`);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const photoUrl = await uploadPhoto.mutateAsync({ file, investigationId: investigation.id });
      await addEvidence.mutateAsync({
        investigation_id: investigation.id,
        photo_url: photoUrl,
        notes: notes.trim() || null,
        location: location.trim() || null,
        evidence_type: evidenceType,
      });
      setNotes('');
      setLocation('');
      toast.success('Evidence ditambahkan');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error('Gagal upload evidence', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const handleAddNote = async () => {
    if (!notes.trim()) {
      toast.error('Isi catatan dulu');
      return;
    }
    try {
      await addEvidence.mutateAsync({
        investigation_id: investigation.id,
        photo_url: null,
        notes: notes.trim(),
        location: location.trim() || null,
        evidence_type: evidenceType,
      });
      setNotes('');
      setLocation('');
      toast.success('Catatan ditambahkan');
    } catch (err) {
      toast.error('Gagal tambah catatan', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const handleDeleteEvidence = async (ev: InvestigationEvidence) => {
    try {
      await deleteEvidence.mutateAsync({ id: ev.id, investigationId: investigation.id });
      toast.success('Evidence dihapus');
    } catch (err) {
      toast.error('Gagal hapus evidence', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const isClosed = investigation.status === 'closed';
  const isOpen = investigation.status === 'active';
  const isPending = investigation.status === 'pending';

  const typeLabels: Record<InvestigationEvidence['evidence_type'], string> = {
    surveillance: 'SURVEILLANCE',
    document: 'DOKUMEN',
    testimonial: 'KESAKSIAN',
    intel: 'INTEL',
    action: 'AKSI',
  };

  return (
    <Dialog open={!!investigation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-data-mono text-data-mono text-primary">{investigation.case_number}</span>
            <ThreatBadge level={investigation.priority} />
            <span className={cn(
              'px-2 py-0.5 rounded border font-data-mono text-[9px] tracking-wider uppercase',
              isOpen && 'border-status-active/40 bg-status-active/10 text-status-active',
              isPending && 'border-status-pending/40 bg-status-pending/10 text-status-pending',
              isClosed && 'border-on-surface-muted/40 bg-on-surface-muted/10 text-on-surface-muted',
            )}>
              {INVESTIGATION_STATUS_META[investigation.status].label}
            </span>
          </div>
          <DialogTitle>{investigation.title}</DialogTitle>
          <DialogDescription>{org ? `Terkait: ${org.name}` : 'Standalone'} · Lead: {investigation.lead_analyst}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="font-data-mono text-on-surface-muted">DIBUKA</p>
              <p className="font-body-md text-on-surface mt-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDate(investigation.created_at)}</p>
            </div>
            <div>
              <p className="font-data-mono text-on-surface-muted">UPDATE TERAKHIR</p>
              <p className="font-body-md text-on-surface mt-1">{formatRelativeTime(investigation.updated_at)}</p>
            </div>
            <div>
              <p className="font-data-mono text-on-surface-muted">DITUTUP</p>
              <p className="font-body-md text-on-surface mt-1">{investigation.closed_at ? formatDate(investigation.closed_at) : '—'}</p>
            </div>
          </div>

          <div>
            <Label>Ringkasan</Label>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{investigation.summary || 'Belum ada ringkasan.'}</p>
          </div>

          <div>
            <Label>Ubah Status</Label>
            <div className="flex gap-2">
              {INVESTIGATION_STATUS.map((s) => {
                const meta = INVESTIGATION_STATUS_META[s];
                return (
                  <Button
                    key={s}
                    variant={investigation.status === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeStatus(s)}
                    disabled={updateInv.isPending}
                  >
                    {meta.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {!isClosed && (
            <div className="border border-border-steel/40 rounded-lg p-3 space-y-3 bg-surface-gunmetal/20">
              <Label className="flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-primary" /> TAMBAH EVIDENCE / CATATAN
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Lokasi (opsional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-xs h-9"
                />
                <Select value={evidenceType} onValueChange={(v) => setEvidenceType(v as InvestigationEvidence['evidence_type'])}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surveillance">Surveillance</SelectItem>
                    <SelectItem value="document">Dokumen</SelectItem>
                    <SelectItem value="testimonial">Kesaksian</SelectItem>
                    <SelectItem value="intel">Intel</SelectItem>
                    <SelectItem value="action">Aksi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Catatan / observasi pemantauan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs min-h-[60px]"
              />
              <div className="flex gap-2">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadPhoto.isPending || addEvidence.isPending}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  {uploadPhoto.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                  UPLOAD FOTO
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={addEvidence.isPending}
                >
                  {addEvidence.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  SIMPAN CATATAN
                </Button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="font-data-mono text-[10px] tracking-widest">TIMELINE EVIDENCE ({evidence.length})</Label>
              {evidenceLoading && <Loader2 className="w-3 h-3 animate-spin text-on-surface-muted" />}
            </div>
            {evidence.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border-steel/30 rounded-lg">
                <FileEdit className="w-8 h-8 text-on-surface-muted/30 mx-auto" />
                <p className="font-data-mono text-[10px] text-on-surface-muted/40 mt-2 tracking-wider">BELUM ADA EVIDENCE</p>
              </div>
            ) : (
              <div className="relative space-y-3 max-h-[400px] overflow-y-auto pr-2">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-border-steel/40" />
                {evidence.map((ev) => (
                  <div key={ev.id} className="relative pl-10">
                    <div className="absolute left-2 top-3 w-3 h-3 rounded-full border-2 border-primary bg-surface z-10" />
                    <div className="border border-border-steel/40 rounded-lg p-3 bg-surface-gunmetal/30 hover:border-primary/30 transition-smooth group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded border border-primary/30 bg-primary/5 font-data-mono text-[8px] text-primary tracking-wider">
                            {typeLabels[ev.evidence_type]}
                          </span>
                          <span className="font-data-mono text-[9px] text-on-surface-muted">{formatRelativeTime(ev.created_at)}</span>
                          {ev.location && (
                            <span className="flex items-center gap-1 font-data-mono text-[9px] text-on-surface-muted/60">
                              <MapPin className="w-2.5 h-2.5" /> {ev.location}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEvidence(ev)}
                          className="opacity-0 group-hover:opacity-100 text-on-surface-muted hover:text-threat-critical transition-smooth"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {ev.photo_url && (
                        <div className="relative w-full h-32 rounded-md overflow-hidden mb-2 bg-surface-container-lowest">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ev.photo_url} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {ev.notes && (
                        <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{ev.notes}</p>
                      )}
                      {ev.uploader_name && (
                        <p className="font-data-mono text-[9px] text-on-surface-muted/50 mt-2">— {ev.uploader_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
