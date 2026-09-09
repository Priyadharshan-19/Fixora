import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { ArrowLeft, Phone, ShieldCheck, MapPin, Clock, CheckCircle2, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { LiveMap } from '@/components/shared/LiveMap';

export const revalidate = 0;

export default async function LiveTrackingPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const db = await getDatabase();

  let job: any = null;
  try {
    job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
  } catch (err) {
    return notFound();
  }

  if (!job) {
    return notFound();
  }

  // Fetch technician profile assigned to this job
  const technician = job.technicianId
    ? await db.collection('users').findOne({ _id: new ObjectId(job.technicianId) })
    : null;

  // Status progression mapping
  const statusSteps = ['ASSIGNED', 'TRAVELING', 'IN_PROGRESS', 'COMPLETED'];
  const currentStepIndex = statusSteps.indexOf(job.status || 'ASSIGNED');

  return (
    <main className="flex-1 bg-neutral-50 min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white px-5 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 text-neutral-700 hover:text-black bg-neutral-50 rounded-full"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-neutral-900">Live Service Tracking</h1>
            <p className="text-[10px] text-neutral-500 font-medium tracking-wide">
              Job #{jobId.slice(-4).toUpperCase()}
            </p>
          </div>
        </div>
        <Badge status={job.status || 'PENDING'} />
      </header>

      {/* Interactive Map Visual */}
      <div className="relative w-full h-72 bg-neutral-200 overflow-hidden border-b border-neutral-100">
        <LiveMap role="customer" jobId={jobId} />
        
        {/* Live ETA Floating Banner overlaying the real map */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm border border-neutral-200 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
          <Clock size={14} className="text-emerald-600 animate-spin" />
          <span className="text-xs font-bold text-neutral-900">
            {job.status === 'COMPLETED' ? 'Service Completed' : 'ETA: ~12 Mins'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 -mt-4 relative z-10">
        {/* Secure OTP Passcode Card */}
        <section className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Service Completion OTP
              </h2>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
              Confidential
            </span>
          </div>

          <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
            Provide this one-time code to your technician only after the repair is completed to your satisfaction.
          </p>

          <div className="flex justify-center gap-3 py-2 bg-neutral-50 rounded-xl border border-neutral-100">
            {(job.otp || '4821').split('').map((char: string, i: number) => (
              <span
                key={i}
                className="w-11 h-12 flex items-center justify-center text-xl font-bold text-neutral-900 bg-white border border-neutral-200 rounded-lg shadow-sm"
              >
                {char}
              </span>
            ))}
          </div>
        </section>

        {/* Technician Profile Card */}
        {technician && (
          <section className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${technician.name}`}
                alt={technician.name}
                className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200"
              />
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{technician.name}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  ★ {technician.rating || '4.9'} • Certified Expert
                </p>
              </div>
            </div>

            <a
              href={`tel:${technician.phone || '+1234567890'}`}
              className="p-3 bg-neutral-900 text-white rounded-xl hover:bg-black transition-colors shadow-sm"
            >
              <Phone size={16} />
            </a>
          </section>
        )}

        {/* Timeline Status Stepper */}
        <section className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-soft">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Service Progress
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Job Assigned', desc: 'Technician confirmed request', key: 'ASSIGNED' },
              { label: 'Traveling', desc: 'Technician is en route with parts', key: 'TRAVELING' },
              { label: 'In-Visit Diagnosis', desc: 'Active diagnostic & repair', key: 'IN_PROGRESS' },
              { label: 'Completed', desc: 'OTP verified & payment settled', key: 'COMPLETED' },
            ].map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {idx !== 3 && (
                    <span
                      className={`absolute left-[11px] top-6 w-[2px] h-8 ${
                        idx < currentStepIndex ? 'bg-neutral-900' : 'bg-neutral-100'
                      }`}
                    />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isPast ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-neutral-900' : isPast ? 'text-neutral-700' : 'text-neutral-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}