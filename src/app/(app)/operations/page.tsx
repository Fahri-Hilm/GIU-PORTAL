'use client';

import { useState, useMemo } from 'react';
import { Plus, Medal, Target, Crosshair, User, Save, Clock, Users as UsersIcon } from 'lucide-react';
import { useOperations, useCreateOperation, useUpdateOperation, useOrganizations } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/misc';
import { OPERATION_STATUS_META, OPERATION_STATUS, type OperationStatus } from '@/lib/constants';
import { formatRelativeTime, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { Operation } from '@/lib/types';

export default function OperationsPage() {
  const { data: operations = [], isLoading } = useOperations();
  const { data: orgs = [] } = useOrganizations();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return operations.filter((o) => statusFilter === 'all' || o.status === statusFilter);
  }, [operations, statusFilter]);

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap opacity-0 animate-fade-slide-up" style={{ animationFillMode: 'forwards' }}>
        <div>
          <p className="font-data-mono text-data-mono text-on-surface-muted">OPERASI LAPANGAN</p>
          <h1 className="font-display-lg text-display-lg text-on-surface mt-1">Operasi</h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-2">
            {operations.length} operasi · {operations.filter((o) => o.status === 'active').length} berlangsung
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> OPERASI BARU
        </Button>
      </div>

      <Card className="opacity-0 animate-fade-slide-up stagger-1">
        <CardContent>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OperationStatus | 'all')}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {OPERATION_STATUS.map((s) => (
                <SelectItem key={s} value={s}>{OPERATION_STATUS_META[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-md">
          {Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Medal} title="Tidak ada operasi" description="Mulai rencanakan operasi baru." action={<Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Operasi Baru</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-md">
          {filtered.map((op, i) => (
            <OperationCard key={op.id} operation={op} index={i} />
          ))}
        </div>
      )}

      <CreateOperationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function OperationCard({ operation, index }: { operation: Operation; index: number }) {
  const { data: orgs = [] } = useOrganizations();
  const updateOp = useUpdateOperation();
  const org = orgs.find((o) => o.id === operation.organization_id);
  const meta = OPERATION_STATUS_META[operation.status];

  const advance = async () => {
    const idx = OPERATION_STATUS.indexOf(operation.status);
    const next = OPERATION_STATUS[Math.min(idx + 1, OPERATION_STATUS.length - 1)];
    await updateOp.mutateAsync({ id: operation.id, patch: { status: next } });
    toast.success(`Status: ${OPERATION_STATUS_META[next].label}`);
  };

  return (
    <Card className="opacity-0 animate-fade-slide-up group" style={{ animationDelay: `${0.05 + index * 0.04}s`, animationFillMode: 'forwards' }}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Medal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-data-mono">{operation.codename}</CardTitle>
              {org && <p className="font-data-mono text-data-mono text-on-surface-muted mt-0.5">{org.name}</p>}
            </div>
          </div>
          <span className="font-label-caps text-[10px] px-2 py-0.5 rounded border" style={{ color: meta.color, borderColor: `color-mix(in srgb, ${meta.color} 40%, transparent)`, background: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}>
            {meta.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Target className="w-3.5 h-3.5 text-on-surface-muted mt-0.5 shrink-0" />
          <p className="font-body-md text-sm text-on-surface-variant">{operation.objective}</p>
        </div>
        {operation.summary && (
          <p className="font-body-md text-xs text-on-surface-muted line-clamp-2">{operation.summary}</p>
        )}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-steel/60 text-xs">
          <div>
            <p className="font-data-mono text-on-surface-muted">OPERATOR</p>
            <p className="font-body-md text-on-surface mt-0.5 truncate">{operation.lead_operator}</p>
          </div>
          <div>
            <p className="font-data-mono text-on-surface-muted">PESERTA</p>
            <p className="font-body-md text-on-surface mt-0.5 tabular-nums flex items-center gap-1"><UsersIcon className="w-3 h-3" /> {operation.participants}</p>
          </div>
          <div>
            <p className="font-data-mono text-on-surface-muted">DIBUAT</p>
            <p className="font-body-md text-on-surface mt-0.5">{formatRelativeTime(operation.created_at)}</p>
          </div>
        </div>
        {operation.status !== 'completed' && operation.status !== 'aborted' && (
          <Button size="sm" variant="outline" className="w-full" onClick={advance} disabled={updateOp.isPending}>
            <Crosshair className="w-3 h-3" /> LANJUTKAN STATUS
          </Button>
        )}
        {operation.executed_at && (
          <p className="font-data-mono text-data-mono text-on-surface-muted text-center">
            DIEKSEKUSI: {formatDateTime(operation.executed_at)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CreateOperationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const create = useCreateOperation();
  const { data: orgs = [] } = useOrganizations();
  const [form, setForm] = useState({
    codename: '',
    organization_id: '' as string | null,
    objective: '',
    lead_operator: '',
    participants: 1,
    summary: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codename.trim() || !form.objective.trim() || !form.lead_operator.trim()) {
      toast.error('Kode nama, tujuan, dan operator utama wajib diisi');
      return;
    }
    try {
      await create.mutateAsync({
        ...form,
        organization_id: form.organization_id || null,
        status: 'planning',
        planned_at: null,
        executed_at: null,
      });
      toast.success(`Operasi ${form.codename} dibuat`);
      onOpenChange(false);
      setForm({ codename: '', organization_id: null, objective: '', lead_operator: '', participants: 1, summary: '' });
    } catch (err) {
      toast.error('Gagal membuat operasi', { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Operasi Baru</DialogTitle>
          <DialogDescription>Rencanakan operasi lapangan baru.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Kode Nama Operasi</Label>
            <Input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} placeholder="OP. [NAMA]" required className="font-data-mono" />
          </div>
          <div>
            <Label>Organisasi Target</Label>
            <Select value={form.organization_id ?? 'none'} onValueChange={(v) => setForm({ ...form, organization_id: v === 'none' ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Pilih target" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak spesifik</SelectItem>
                {orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tujuan Operasi</Label>
            <Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} rows={2} placeholder="Mis. Penangkapan target prioritas" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Operator Utama</Label>
              <Input value={form.lead_operator} onChange={(e) => setForm({ ...form, lead_operator: e.target.value })} placeholder="Mis. Team Leader Alpha" required />
            </div>
            <div>
              <Label>Jumlah Peserta</Label>
              <Input type="number" min={1} value={form.participants} onChange={(e) => setForm({ ...form, participants: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Ringkasan / Catatan</Label>
            <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
            <Button type="submit" disabled={create.isPending}><Save className="w-4 h-4" /> {create.isPending ? 'MENYIMPAN...' : 'BUAT OPERASI'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
