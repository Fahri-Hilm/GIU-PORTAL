'use client';

import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  cursorGlow: boolean;
  toggleSidebar: () => void;
  setCursorGlow: (v: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  cursorGlow: true,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCursorGlow: (v) => set({ cursorGlow: v }),
}));
