'use client';

import { BackgroundCanvas } from '@/components/background-canvas';
import { CursorGlow } from '@/components/cursor-glow';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { useUIStore } from '@/stores/ui';

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapse = useUIStore((s) => s.sidebarCollapsed);
  return (
    <>
      <BackgroundCanvas />
      <CursorGlow />
      <Sidebar />
      <div
        className="relative z-10 flex flex-col h-screen"
        style={{ marginLeft: collapse ? 72 : 280, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <Topbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}
