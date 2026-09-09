import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { MapPin, Phone, Navigation2, CheckCircle2 } from 'lucide-react';
import { LiveMap } from '@/components/shared/LiveMap';

export default async function TransitPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const db = await getDatabase();
  
  const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
  const customer = job?.customerId ? await db.collection('users').findOne({ _id: job.customerId }) : null;

  if (!job) {
    return <div className="p-6 text-center mt-20">Job not found.</div>;
  }

  // Server Action: Step 7 - Arrive at Location
  async function arriveAtLocation() {
    'use server';
    const db = await getDatabase();
    
    // Update status to IN_PROGRESS to signify arrival and active repair
    await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { $set: { status: 'IN_PROGRESS', updatedAt: new Date() } }
    );
    
    // Unlocks Step 8: The In-Visit AI Assistant
    redirect(`/chat/${jobId}`);
  }

  return (
    <main className="flex-1 bg-neutral-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white px-5 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-sm font-bold text-neutral-900">In Transit</h1>
          <p className="text-[10px] text-neutral-500 font-medium tracking-wide">Job #{jobId.slice(-4).toUpperCase()}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
          <Navigation2 size={12} className="fill-emerald-700" />
          EN ROUTE
        </div>
      </header>

      {/* Technician Map Visual */}
      <div className="relative w-full flex-1 bg-neutral-200 overflow-hidden border-b border-neutral-100 min-h-[300px]">
        <LiveMap role="technician" jobId={jobId} />
      </div>

      {/* Customer Contact Card */}
      <div className="bg-white p-5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10 -mt-6">
        <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6" />
        
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Destination Details</h2>
        
        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-100 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer?.name || 'Customer'}`} 
              alt="Customer" 
              className="w-12 h-12 rounded-full border border-neutral-200 bg-white"
            />
            <div>
              <h3 className="text-sm font-bold text-neutral-900">{customer?.name || 'Customer'}</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5 max-w-[180px] truncate">123 Local Street, City District</p>
            </div>
          </div>
          <a href={`tel:${customer?.phone || '+1234567890'}`} className="w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-neutral-700 shadow-sm hover:bg-neutral-50">
            <Phone size={16} />
          </a>
        </div>

        {/* Arrive Button (Triggers transition to Chat) */}
        <form action={arriveAtLocation}>
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-2xl text-sm font-bold shadow-elevated hover:bg-black transition-all flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            I Have Arrived
          </button>
        </form>
      </div>
    </main>
  );
}