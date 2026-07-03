'use client';

import { BackgroundCanvas } from '@/components/background-canvas';
import { CursorGlow } from '@/components/cursor-glow';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { useUIStore } from '@/stores/ui';

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapse = useUIStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebar = useUIStore((s) => s.setMobileSidebar);

  return (
    <>
      <BackgroundCanvas />
      <CursorGlow />
      <Sidebar />
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}
      <style>{`
        .app-shell-content { margin-left: ${collapse ? 72 : 280}px; transition: margin-left 0.3s cubic-bezier(0.16,1,0.3,1); }
        @media (max-width: 767px) { .app-shell-content { margin-left: 0 !important; } }
      `}</style>
      <div className="app-shell-content relative z-10 flex flex-col h-screen">
        <Topbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}
