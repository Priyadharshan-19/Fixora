'use client';

import React, { useEffect, useState } from 'react';
import { Brain, Wrench, AlertTriangle } from 'lucide-react';
import { getPrepInsights } from '@/lib/ai-actions';

export default function AiInsightsClient({ applianceName, issue }: { applianceName: string, issue: string }) {
  const [data, setData] = useState<{ insight: string, parts: string[] } | null>(null);

  useEffect(() => {
    async function fetchAi() {
      const result = await getPrepInsights(applianceName, issue);
      setData(result);
    }
    fetchAi();
  }, [applianceName, issue]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Insight Card */}
      <div className={`p-5 rounded-2xl border transition-all ${data ? 'bg-emerald-50/50 border-emerald-100' : 'bg-neutral-50 border-neutral-100 animate-pulse'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-xs font-bold flex items-center gap-2 mb-2 ${data ? 'text-emerald-800' : 'text-neutral-700'}`}>
              <Brain size={16} /> AI Predictive Insight
            </h3>
            <p className={`text-sm leading-relaxed ${data ? 'text-emerald-900 font-medium' : 'text-neutral-500'}`}>
              {data ? data.insight : 'Analyzing historical failure rates for this model...'}
            </p>
          </div>
          <Brain size={48} className={`opacity-10 ${data ? 'text-emerald-900' : 'text-neutral-900'}`} />
        </div>
      </div>

      {/* Parts Card */}
      <div>
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-3">
          <Wrench size={18} className="text-neutral-400" /> Required Parts
        </h3>
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
          {!data ? (
             <div className="flex flex-col items-center justify-center py-4 opacity-50">
               <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin mb-2" />
               <p className="text-xs text-neutral-500">Checking inventory requirements...</p>
             </div>
          ) : data.parts.length === 0 ? (
            <div className="flex flex-col items-center text-center py-4">
              <AlertTriangle size={24} className="text-amber-500 mb-2" />
              <p className="text-xs text-neutral-500">No specific parts flagged by AI. Proceed with standard toolkit.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.parts.map((part, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <div className="w-6 h-6 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[10px] text-neutral-500">
                    {idx + 1}
                  </div>
                  {part}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}