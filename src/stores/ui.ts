'use client';

import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  cursorGlow: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setMobileSidebar: (v: boolean) => void;
  setCursorGlow: (v: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  cursorGlow: true,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  setMobileSidebar: (v) => set({ mobileSidebarOpen: v }),
  setCursorGlow: (v) => set({ cursorGlow: v }),
}));
