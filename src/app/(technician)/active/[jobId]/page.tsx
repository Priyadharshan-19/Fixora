'use client';

import React, { useState } from 'react';
import { ArrowLeft, Edit3, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';

export default function ServiceDetailsScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'notes'>('overview');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const parts = [
    { name: 'Drain Hose', cost: '$45.00' },
    { name: 'Valve Cap', cost: '$12.00' },
  ];

  return (
    <main className="flex-1 bg-white min-h-screen flex flex-col justify-between p-5">
      <div>
        {/* Navigation Bar */}
        <header className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <Link href="/technician/jobs" className="p-2 -ml-2 text-neutral-700 hover:text-black">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-semibold text-neutral-900">Service Details</h1>
          <button 
            aria-label="Edit service details"
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-black"
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
        </header>

        {/* Tab Selection */}
        <div className="flex gap-2 my-4 bg-neutral-100 p-1 rounded-xl">
          {(['overview', 'parts', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-neutral-50/70 border border-neutral-100 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Issue Found
              </span>
              <p className="text-xs text-neutral-800 font-medium mt-1">
                Washer not balanced due to uneven load.
              </p>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-100 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Services Performed
              </span>
              <ul className="mt-2 space-y-1.5 text-xs text-neutral-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Balanced the load assembly.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Adjusted shock absorber mountings.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Tested motor cycling for spin stability.
                </li>
              </ul>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-100 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Parts Replaced
                </span>
              </div>
              <div className="space-y-2">
                {parts.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-neutral-700">
                    <span>{p.name}</span>
                    <span className="font-semibold text-neutral-900">{p.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-100 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Recommendations
              </span>
              <p className="text-xs text-neutral-700 mt-1">
                • Avoid overloading the washer drum.<br />
                • Perform routine monthly tub cleaning cycles.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Action Button */}
      <div className="pt-4 bg-white border-t border-neutral-100">
        <Button onClick={() => setShowOtpModal(true)}>
          Request OTP
        </Button>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-base font-semibold text-neutral-900">
                Request OTP (Completed)
              </h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                An unlock code was sent to customer's phone to verify service completion.
              </p>
            </div>

            <OtpInput length={4} onComplete={(code) => console.log('Verifying OTP:', code)} />

            <div className="text-center mb-6">
              <p className="text-xs text-neutral-400">
                Resend OTP in <span className="font-semibold text-neutral-700">00:45</span>
              </p>
            </div>

            <div className="space-y-2">
              <Button onClick={() => setShowOtpModal(false)}>
                Verify & Complete
              </Button>
              <button
                onClick={() => setShowOtpModal(false)}
                className="w-full py-2.5 text-xs font-medium text-neutral-400 hover:text-neutral-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}