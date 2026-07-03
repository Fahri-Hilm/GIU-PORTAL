'use client';

import { useState, useMemo } from 'react';
import { Plus, Search as SearchIcon, Filter, Search, FileEdit, User, Save, Clock, ChevronRight } from 'lucide-react';
import { useInvestigations, useCreateInvestigation, useUpdateInvestigation, useOrganizations } from '@/lib/queries';
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
import type { Investigation } from '@/lib/types';

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
  if (!investigation) return null;
  const org = orgs.find((o) => o.id === investigation.organization_id);

  const changeStatus = async (status: InvestigationStatus) => {
    await updateInv.mutateAsync({ id: investigation.id, patch: { status, closed_at: status === 'closed' ? new Date().toISOString() : null } });
    toast.success(`Status diubah ke ${INVESTIGATION_STATUS_META[status].label}`);
    onClose();
  };

  return (
    <Dialog open={!!investigation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="font-data-mono text-data-mono text-primary">{investigation.case_number}</span>
            <ThreatBadge level={investigation.priority} />
          </div>
          <DialogTitle>{investigation.title}</DialogTitle>
          <DialogDescription>{org ? `Terkait: ${org.name}` : 'Standalone'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-data-mono text-on-surface-muted">ANALIS UTAMA</p>
              <p className="font-body-md text-on-surface mt-1 flex items-center gap-1.5"><User className="w-3 h-3" /> {investigation.lead_analyst}</p>
            </div>
            <div>
              <p className="font-data-mono text-on-surface-muted">DIBUKA</p>
              <p className="font-body-md text-on-surface mt-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDate(investigation.created_at)}</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
