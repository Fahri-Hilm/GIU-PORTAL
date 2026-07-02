'use client';

import dynamic from 'next/dynamic';

const IntelligenceMap = dynamic(() => import('./intelligence-map').then((m) => m.IntelligenceMap), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-lg border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="font-data-mono text-data-mono text-on-surface-muted">MEMUAT PETA...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-80px)] relative">
      <IntelligenceMap />
    </div>
  );
}
