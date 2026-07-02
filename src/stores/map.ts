'use client';

import { create } from 'zustand';

interface MapState {
  selectedMarkerId: string | null;
  selectedOrgId: string | null;
  zoom: number;
  center: { x: number; y: number };
  mode: 'view' | 'add-marker' | 'add-territory';
  territoryDraft: { x: number; y: number }[];
  selectMarker: (id: string | null) => void;
  selectOrg: (id: string | null) => void;
  setZoom: (z: number) => void;
  setCenter: (c: { x: number; y: number }) => void;
  setMode: (m: MapState['mode']) => void;
  addTerritoryPoint: (p: { x: number; y: number }) => void;
  clearTerritoryDraft: () => void;
}

export const useMapStore = create<MapState>()((set) => ({
  selectedMarkerId: null,
  selectedOrgId: null,
  zoom: 1,
  center: { x: 500, y: 500 },
  mode: 'view',
  territoryDraft: [],
  selectMarker: (id) => set({ selectedMarkerId: id }),
  selectOrg: (id) => set({ selectedOrgId: id }),
  setZoom: (z) => set({ zoom: Math.max(0.4, Math.min(4, z)) }),
  setCenter: (c) => set({ center: c }),
  setMode: (m) => set({ mode: m, territoryDraft: m === 'add-territory' ? [] : [] }),
  addTerritoryPoint: (p) => set((s) => ({ territoryDraft: [...s.territoryDraft, p] })),
  clearTerritoryDraft: () => set({ territoryDraft: [] }),
}));
