'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Circle, Line, Text, Rect, Path, Star } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import {
  Plus,
  Minus,
  LocateFixed,
  X,
  Trash2,
  Pencil,
  Layers,
  MapPin,
  Hexagon,
  Crosshair,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form';
import { Textarea } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThreatBadge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useMarkers, useTerritories, useOrganizations, useCreateMarker, useUpdateMarker, useDeleteMarker, useCreateTerritory, useDeleteTerritory } from '@/lib/queries';
import { useMapStore } from '@/stores/map';
import { THREAT_META, MAP_DIMENSIONS, type ThreatLevel } from '@/lib/constants';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { MapMarker } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

const MARKER_TYPE_LABEL: Record<MapMarker['type'], string> = {
  hq: 'Markas Besar',
  stash: 'Stash House',
  meetup: 'Titik Kumpul',
  incident: 'Insiden',
  asset: 'Aset GIU',
};

const MARKER_TYPE_SHAPE: Record<MapMarker['type'], 'circle' | 'square' | 'triangle' | 'star' | 'hex'> = {
  hq: 'hex',
  stash: 'square',
  meetup: 'circle',
  incident: 'triangle',
  asset: 'star',
};

export function IntelligenceMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(0.6);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showTerritories, setShowTerritories] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [editingMarker, setEditingMarker] = useState<Partial<MapMarker> | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [mapImage] = useImage('/map.webp');
  const { data: markers = [] } = useMarkers();
  const { data: territories = [] } = useTerritories();
  const { data: orgs = [] } = useOrganizations();

  const createMarker = useCreateMarker();
  const updateMarker = useUpdateMarker();
  const deleteMarker = useDeleteMarker();
  const createTerritory = useCreateTerritory();
  const deleteTerritory = useDeleteTerritory();

  const mapStore = useMapStore();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    const initialScale = Math.min(el.clientWidth, el.clientHeight) / MAP_DIMENSIONS.width;
    setScale(initialScale * 0.95);
    setPosition({
      x: (el.clientWidth - MAP_DIMENSIONS.width * initialScale * 0.95) / 2,
      y: (el.clientHeight - MAP_DIMENSIONS.height * initialScale * 0.95) / 2,
    });
    return () => ro.disconnect();
  }, []);

  const orgMap = useCallback(
    (id: string | null) => orgs.find((o) => o.id === id) ?? null,
    [orgs],
  );

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1.08;
    const newScale = Math.max(0.2, Math.min(4, direction > 0 ? oldScale * factor : oldScale / factor));
    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  let panning = false;
  let panStart = { x: 0, y: 0, posX: 0, posY: 0 };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() || e.target.attrs.name === 'map-bg') {
      if (mapStore.mode === 'add-marker') {
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        const mapX = (pos.x - position.x) / scale;
        const mapY = (pos.y - position.y) / scale;
        const newMarker: Partial<MapMarker> = {
          label: 'Penanda Baru',
          type: 'asset',
          x: Math.round(mapX),
          y: Math.round(mapY),
          threat_level: 'medium',
          organization_id: mapStore.selectedOrgId,
          notes: '',
        };
        setEditingMarker(newMarker);
        setSheetOpen(true);
        mapStore.setMode('view');
        return;
      }
      if (mapStore.mode === 'add-territory') {
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        const mapX = (pos.x - position.x) / scale;
        const mapY = (pos.y - position.y) / scale;
        mapStore.addTerritoryPoint({ x: mapX, y: mapY });
        return;
      }
      panning = true;
      panStart = { x: e.evt.clientX, y: e.evt.clientY, posX: position.x, posY: position.y };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!panning) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPosition({ x: panStart.posX + dx, y: panStart.posY + dy });
    };
    const handleMouseUp = () => {
      panning = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMarkerDragEnd = (e: Konva.KonvaEventObject<DragEvent>, marker: MapMarker) => {
    const node = e.target;
    const newX = Math.max(0, Math.min(MAP_DIMENSIONS.width, node.x()));
    const newY = Math.max(0, Math.min(MAP_DIMENSIONS.height, node.y()));
    node.position({ x: newX, y: newY });
    updateMarker.mutate({ id: marker.id, patch: { x: Math.round(newX), y: Math.round(newY) } });
    toast.success(`"${marker.label}" dipindahkan`, { description: `Koordinat: ${Math.round(newX)}, ${Math.round(newY)}` });
  };

  const handleMarkerClick = (marker: MapMarker) => {
    if (mapStore.mode !== 'view') return;
    mapStore.selectMarker(marker.id);
    setEditingMarker({ ...marker });
    setSheetOpen(true);
  };

  const zoomBy = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    const oldScale = scale;
    const mousePointTo = {
      x: (cx - position.x) / oldScale,
      y: (cy - position.y) / oldScale,
    };
    const newScale = Math.max(0.2, Math.min(4, oldScale * factor));
    setScale(newScale);
    setPosition({
      x: cx - mousePointTo.x * newScale,
      y: cy - mousePointTo.y * newScale,
    });
  };

  const resetView = () => {
    const el = containerRef.current;
    if (!el) return;
    const s = Math.min(el.clientWidth, el.clientHeight) / MAP_DIMENSIONS.width;
    setScale(s * 0.95);
    setPosition({
      x: (el.clientWidth - MAP_DIMENSIONS.width * s * 0.95) / 2,
      y: (el.clientHeight - MAP_DIMENSIONS.height * s * 0.95) / 2,
    });
  };

  const handleSaveMarker = async () => {
    if (!editingMarker) return;
    if (!editingMarker.label) {
      toast.error('Label wajib diisi');
      return;
    }
    if (editingMarker.id) {
      updateMarker.mutate({ id: editingMarker.id, patch: editingMarker });
      toast.success('Penanda diperbarui');
    } else {
      createMarker.mutate(editingMarker as Omit<MapMarker, 'id' | 'created_at' | 'updated_at'>);
      toast.success('Penanda ditambahkan');
    }
    setSheetOpen(false);
    setEditingMarker(null);
    mapStore.selectMarker(null);
  };

  const handleDeleteMarker = async () => {
    if (!editingMarker?.id) return;
    deleteMarker.mutate(editingMarker.id);
    toast.success('Penanda dihapus');
    setSheetOpen(false);
    setEditingMarker(null);
    mapStore.selectMarker(null);
  };

  const handleSaveTerritory = async () => {
    if (mapStore.territoryDraft.length < 3 || !mapStore.selectedOrgId) {
      toast.error('Wilayah minimal 3 titik dan organisasi harus dipilih');
      return;
    }
    const org = orgMap(mapStore.selectedOrgId);
    createTerritory.mutate({
      organization_id: mapStore.selectedOrgId,
      name: `Wilayah ${org?.name ?? ''}`,
      points: mapStore.territoryDraft,
    });
    toast.success('Wilayah disimpan');
    mapStore.clearTerritoryDraft();
    mapStore.setMode('view');
    mapStore.selectOrg(null);
  };

  const selectedMarker = markers.find((m) => m.id === mapStore.selectedMarkerId) ?? null;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-background">
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTap={handleMouseDown}
      >
        <Layer listening={false}>
          <Rect x={-2000} y={-2000} width={5000} height={5000} fill="#0b0d10" />
        </Layer>
        <Layer>
          {mapImage && (
            <KonvaImage
              image={mapImage}
              x={0}
              y={0}
              width={MAP_DIMENSIONS.width}
              height={MAP_DIMENSIONS.height}
              name="map-bg"
              filters={[]}
            />
          )}
          <Rect
            x={0}
            y={0}
            width={MAP_DIMENSIONS.width}
            height={MAP_DIMENSIONS.height}
            stroke="#e6c383"
            strokeWidth={2 / scale}
            cornerRadius={0}
            listening={false}
          />
        </Layer>

        {showTerritories && (
          <Layer>
            {territories.map((t) => {
              const org = orgMap(t.organization_id);
              const flatPoints = t.points.flatMap((p) => [p.x, p.y]);
              const color = org?.primary_color ?? '#e6c383';
              return (
                <Group key={t.id}>
                  <Line
                    points={flatPoints}
                    closed
                    fill={color}
                    opacity={0.15}
                    stroke={color}
                    strokeWidth={2}
                    dash={[8, 4]}
                    onClick={() => mapStore.selectOrg(t.organization_id)}
                    onTap={() => mapStore.selectOrg(t.organization_id)}
                  />
                  {showLabels && (
                    <Text
                      text={t.name}
                      x={t.points.reduce((s, p) => s + p.x, 0) / t.points.length - 60}
                      y={t.points.reduce((s, p) => s + p.y, 0) / t.points.length - 10}
                      width={120}
                      align="center"
                      fontFamily="IBM Plex Sans"
                      fontSize={11}
                      fontStyle="bold"
                      fill={color}
                      listening={false}
                      shadowColor="#000"
                      shadowBlur={4}
                      shadowOpacity={0.8}
                    />
                  )}
                </Group>
              );
            })}
            {mapStore.mode === 'add-territory' && mapStore.territoryDraft.length > 0 && (
              <Line
                points={mapStore.territoryDraft.flatMap((p) => [p.x, p.y])}
                closed={mapStore.territoryDraft.length >= 3}
                stroke="#e6c383"
                strokeWidth={2}
                dash={[6, 3]}
                fill="rgba(230,195,131,0.1)"
              />
            )}
            {mapStore.mode === 'add-territory' &&
              mapStore.territoryDraft.map((p, i) => (
                <Circle
                  key={i}
                  x={p.x}
                  y={p.y}
                  radius={6 / scale}
                  fill="#e6c383"
                  stroke="#412d00"
                  strokeWidth={1 / scale}
                />
              ))}
          </Layer>
        )}

        <Layer>
          {markers.map((m) => {
            const meta = THREAT_META[m.threat_level];
            const org = orgMap(m.organization_id);
            const color = m.threat_level === 'unknown' ? (org?.primary_color ?? '#e6c383') : meta.color;
            const isSelected = mapStore.selectedMarkerId === m.id;
            const shape = MARKER_TYPE_SHAPE[m.type];
            return (
              <Group
                key={m.id}
                x={m.x}
                y={m.y}
                draggable={mapStore.mode === 'view'}
                onDragEnd={(e) => handleMarkerDragEnd(e, m)}
                onClick={() => handleMarkerClick(m)}
                onTap={() => handleMarkerClick(m)}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = 'crosshair';
                }}
              >
                {isSelected && (
                  <Circle
                    radius={26 / scale}
                    stroke={color}
                    strokeWidth={2 / scale}
                    opacity={0.6}
                    listening={false}
                  />
                )}
                {m.threat_level === 'critical' && (
                  <Circle radius={22 / scale} stroke={color} strokeWidth={1.5 / scale} opacity={0.5} listening={false} />
                )}
                <MarkerShape shape={shape} color={color} scale={1 / scale} size={16} />
                {showLabels && (
                  <Text
                    text={m.label}
                    x={-100}
                    y={22 / scale}
                    width={200}
                    align="center"
                    fontFamily="Inter"
                    fontSize={11 / scale}
                    fill="#e2e2e6"
                    listening={false}
                    shadowColor="#000"
                    shadowBlur={4 / scale}
                    shadowOpacity={0.9}
                  />
                )}
                <Text
                  text={MARKER_TYPE_LABEL[m.type].toUpperCase()}
                  x={-100}
                  y={36 / scale}
                  width={200}
                  align="center"
                  fontFamily="IBM Plex Sans"
                  fontSize={8 / scale}
                  fontStyle="bold"
                  letterSpacing={1}
                  fill={color}
                  opacity={0.8}
                  listening={false}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      <div className="absolute top-margin-edge left-margin-edge flex items-center gap-2 z-10 opacity-0 animate-fade-slide-up">
        <div className="glass-panel rounded-lg px-4 py-2">
          <p className="font-data-mono text-data-mono text-on-surface-muted">PETA INTELIJEN SAN ANDREAS</p>
          <p className="font-label-caps text-label-caps text-primary">{markers.length} PENANDA · {territories.length} WILAYAH</p>
        </div>
      </div>

      <div className="absolute bottom-margin-edge left-margin-edge flex flex-col gap-2 z-10 opacity-0 animate-fade-slide-up stagger-2">
        <Button variant="outline" size="icon" onClick={() => zoomBy(1.2)} title="Perbesar">
          <Plus className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => zoomBy(1 / 1.2)} title="Perkecil">
          <Minus className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={resetView} title="Reset tampilan" className="mt-2">
          <LocateFixed className="w-5 h-5" />
        </Button>
      </div>

      <div className="absolute bottom-margin-edge right-margin-edge z-10 flex flex-col gap-2 opacity-0 animate-fade-slide-up stagger-3">
        <div className="glass-panel rounded-lg p-2 flex flex-col gap-1">
          <Button
            variant={mapStore.mode === 'add-marker' ? 'default' : 'ghost'}
            size="iconSm"
            onClick={() => mapStore.setMode(mapStore.mode === 'add-marker' ? 'view' : 'add-marker')}
            title="Tambah penanda"
          >
            <MapPin className="w-4 h-4" />
          </Button>
          <Button
            variant={mapStore.mode === 'add-territory' ? 'default' : 'ghost'}
            size="iconSm"
            onClick={() => {
              mapStore.setMode(mapStore.mode === 'add-territory' ? 'view' : 'add-territory');
              mapStore.selectOrg(orgs[0]?.id ?? null);
            }}
            title="Tambah wilayah"
          >
            <Hexagon className="w-4 h-4" />
          </Button>
          <div className="h-px bg-border-steel my-1" />
          <Button
            variant={showTerritories ? 'default' : 'ghost'}
            size="iconSm"
            onClick={() => setShowTerritories((v) => !v)}
            title={showTerritories ? 'Sembunyikan wilayah' : 'Tampilkan wilayah'}
          >
            {showTerritories ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            variant={showLabels ? 'default' : 'ghost'}
            size="iconSm"
            onClick={() => setShowLabels((v) => !v)}
            title="Toggle label"
          >
            <Layers className="w-4 h-4" />
          </Button>
        </div>
        <div className="glass-panel rounded-lg px-3 py-2 font-data-mono text-data-mono text-on-surface-muted">
          ZOOM {(scale * 100).toFixed(0)}%
        </div>
      </div>

      {mapStore.mode === 'add-marker' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 glass-panel rounded-xl p-4 max-w-sm text-center opacity-0 animate-fade-slide-up">
          <Crosshair className="w-6 h-6 text-primary mx-auto mb-2 animate-pulse" />
          <p className="font-label-caps text-label-caps text-primary mb-1">MODE TAMBAH PENANDA</p>
          <p className="font-body-md text-xs text-on-surface-variant">Klik di peta untuk menempatkan penanda baru</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => mapStore.setMode('view')}>
            Batal
          </Button>
        </div>
      )}

      {mapStore.mode === 'add-territory' && (
        <div className="absolute top-margin-edge right-margin-edge z-20 glass-panel rounded-xl p-4 w-80 opacity-0 animate-fade-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-label-caps text-label-caps text-primary">MODE GAMBAR WILAYAH</p>
              <p className="font-data-mono text-data-mono text-on-surface-muted mt-1">{mapStore.territoryDraft.length} TITIK</p>
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => {
                mapStore.clearTerritoryDraft();
                mapStore.setMode('view');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <Label>Organisasi</Label>
              <Select value={mapStore.selectedOrgId ?? ''} onValueChange={(v) => mapStore.selectOrg(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih organisasi" />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="font-body-md text-xs text-on-surface-muted">
              Klik di peta untuk menambah titik. Butuh minimal 3 titik.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => mapStore.clearTerritoryDraft()}
                disabled={mapStore.territoryDraft.length === 0}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSaveTerritory}
                disabled={mapStore.territoryDraft.length < 3 || !mapStore.selectedOrgId}
              >
                <Save className="w-3 h-3" /> SIMPAN
              </Button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={(o) => { setSheetOpen(o); if (!o) { setEditingMarker(null); mapStore.selectMarker(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {editingMarker && (
            <>
              <SheetHeader>
                <SheetTitle>{editingMarker.id ? 'Edit Penanda' : 'Penanda Baru'}</SheetTitle>
                <SheetDescription>
                  {editingMarker.id ? `Diperbarui ${formatRelativeTime(editingMarker.updated_at ?? new Date().toISOString())}` : 'Lengkapi detail penanda intelijen'}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-gutter-md space-y-4">
                <div>
                  <Label>Label</Label>
                  <Input
                    value={editingMarker.label ?? ''}
                    onChange={(e) => setEditingMarker({ ...editingMarker, label: e.target.value })}
                    placeholder="Nama penanda"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipe</Label>
                    <Select
                      value={editingMarker.type ?? 'asset'}
                      onValueChange={(v) => setEditingMarker({ ...editingMarker, type: v as MapMarker['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MARKER_TYPE_LABEL).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tingkat Ancaman</Label>
                    <Select
                      value={editingMarker.threat_level ?? 'medium'}
                      onValueChange={(v) => setEditingMarker({ ...editingMarker, threat_level: v as ThreatLevel })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(THREAT_META).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Organisasi Terkait</Label>
                  <Select
                    value={editingMarker.organization_id ?? 'none'}
                    onValueChange={(v) => setEditingMarker({ ...editingMarker, organization_id: v === 'none' ? null : v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak terkait</SelectItem>
                      {orgs.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Koordinat X</Label>
                    <Input
                      type="number"
                      value={Math.round(editingMarker.x ?? 0)}
                      onChange={(e) => setEditingMarker({ ...editingMarker, x: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Koordinat Y</Label>
                    <Input
                      type="number"
                      value={Math.round(editingMarker.y ?? 0)}
                      onChange={(e) => setEditingMarker({ ...editingMarker, y: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Catatan</Label>
                  <Textarea
                    value={editingMarker.notes ?? ''}
                    onChange={(e) => setEditingMarker({ ...editingMarker, notes: e.target.value })}
                    placeholder="Observasi, intelijen tambahan..."
                    rows={4}
                  />
                </div>
                {editingMarker.organization_id && orgMap(editingMarker.organization_id) && (
                  <Link
                    href={`/organizations?id=${editingMarker.organization_id}`}
                    className="block p-3 rounded-lg border border-border-steel bg-surface-gunmetal/40 hover:border-primary/40 transition-smooth"
                  >
                    <p className="font-data-mono text-data-mono text-on-surface-muted">ORGANISASI TERKAIT</p>
                    <p className="font-body-md text-sm text-on-surface mt-1">{orgMap(editingMarker.organization_id)!.name}</p>
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 p-gutter-md border-t border-border-steel/60">
                {editingMarker.id && (
                  <Button variant="destructive" size="icon" onClick={handleDeleteMarker} title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={() => { setSheetOpen(false); setEditingMarker(null); }}>
                  Batal
                </Button>
                <Button className="flex-1" onClick={handleSaveMarker}>
                  <Save className="w-4 h-4" /> SIMPAN
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MarkerShape({
  shape,
  color,
  scale,
  size,
}: {
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'hex';
  color: string;
  scale: number;
  size: number;
}) {
  const r = size * scale;
  switch (shape) {
    case 'circle':
      return <Circle radius={r} fill={color} stroke="#0b0d10" strokeWidth={2 * scale} shadowColor={color} shadowBlur={12 * scale} shadowOpacity={0.5} />;
    case 'square':
      return <Rect x={-r} y={-r} width={r * 2} height={r * 2} fill={color} stroke="#0b0d10" strokeWidth={2 * scale} cornerRadius={3 * scale} shadowColor={color} shadowBlur={12 * scale} shadowOpacity={0.5} />;
    case 'triangle':
      return (
        <Path
          data={`M 0 ${-r} L ${r} ${r * 0.8} L ${-r} ${r * 0.8} Z`}
          fill={color}
          stroke="#0b0d10"
          strokeWidth={2 * scale}
          shadowColor={color}
          shadowBlur={12 * scale}
          shadowOpacity={0.5}
        />
      );
    case 'star':
      return <Star numPoints={5} innerRadius={r * 0.5} outerRadius={r} fill={color} stroke="#0b0d10" strokeWidth={2 * scale} shadowColor={color} shadowBlur={12 * scale} shadowOpacity={0.5} />;
    case 'hex':
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        pts.push(Math.cos(a) * r, Math.sin(a) * r);
      }
      return <Line points={pts} closed fill={color} stroke="#0b0d10" strokeWidth={2 * scale} shadowColor={color} shadowBlur={12 * scale} shadowOpacity={0.5} />;
  }
}
