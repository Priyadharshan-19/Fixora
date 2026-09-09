'use client';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-neutral-400">Loading live GPS...</span>
      </div>
    </div>
  ),
});

export function LiveMap({ role, jobId }: { role: 'customer' | 'technician', jobId: string }) {
  return <DynamicMap role={role} jobId={jobId} />;
}