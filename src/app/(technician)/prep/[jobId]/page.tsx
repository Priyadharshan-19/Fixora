import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { ArrowLeft, Send } from 'lucide-react';
import AiInsightsClient from './AiInsightsClient';
import PhotoGalleryClient from './PhotoGalleryClient';

export default async function PreVisitPrepPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const db = await getDatabase();

  const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
  if (!job) {
    return <div className="p-6 text-center mt-20">Job not found.</div>;
  }

  const appliance = job.applianceId 
    ? await db.collection('appliances').findOne({ _id: job.applianceId }) 
    : null;

  const applianceName = appliance?.brand || 'Appliance';

  async function startJourney() {
    'use server';
    const db = await getDatabase();
    await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { $set: { status: 'TRAVELING', updatedAt: new Date() } }
    );
    redirect(`/transit/${jobId}`);
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col justify-between max-w-md mx-auto border-x border-neutral-100 shadow-sm relative">
      <div>
        <header className="bg-white px-5 py-4 border-b border-neutral-100 flex items-center gap-3 sticky top-0 z-10">
          <Link href="/jobs" className="p-2 -ml-2 text-neutral-700 hover:text-black">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-neutral-900">Pre-Visit Prep</h1>
            <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">Job #{jobId.slice(-4).toUpperCase()}</p>
          </div>
        </header>

        <div className="p-5 space-y-6 pb-8">
          {/* Reported Issue Card */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Reported Issue</h2>
            <p className="text-sm font-bold text-neutral-800 leading-snug">"{job.issueDescription}"</p>
            <div className="inline-block px-2.5 py-1 bg-rose-50 text-rose-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
              NORMAL PRIORITY
            </div>
          </div>

          {/* Attached Customer Photos */}
          <PhotoGalleryClient photos={job.photos || []} />

          {/* AI Insights & Required Parts */}
          <AiInsightsClient applianceName={applianceName} issue={job.issueDescription} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-neutral-100 p-4 z-10 shadow-lg">
        <form action={startJourney}>
          <button
            type="submit"
            className="w-full bg-neutral-900 text-white py-3.5 px-6 rounded-2xl text-xs font-bold shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <Send size={14} />
            Start Journey
          </button>
        </form>
      </div>
    </main>
  );
}