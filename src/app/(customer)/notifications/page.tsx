import React from 'react';
import { BottomNav } from '@/components/shared/BottomNav';
import { BellRing, ShieldCheck } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <main className="flex-1 pb-24 px-5 pt-8 bg-neutral-50/50 min-h-screen">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">Alerts</h1>
      
      <div className="flex flex-col gap-3">
        {/* Security Notification */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-soft flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900">Account Secured</h3>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">Your Fixora profile was successfully created and verified.</p>
            <span className="text-[9px] font-bold text-neutral-400 mt-2 block uppercase tracking-wider">Just now</span>
          </div>
        </div>

        {/* Welcome Notification */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-soft flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <BellRing size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900">Welcome to Fixora!</h3>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">Tap the + button below to request your first appliance repair service.</p>
            <span className="text-[9px] font-bold text-neutral-400 mt-2 block uppercase tracking-wider">Today</span>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </main>
  );
}