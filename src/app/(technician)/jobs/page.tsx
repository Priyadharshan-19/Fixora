import React from 'react';
import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { TechBottomNav } from '@/components/shared/TechBottomNav';
import { Badge } from '@/components/ui/Badge';
import NearbyJobsClient from './NearbyJobsClient'; // Our new GPS Client Component

export const revalidate = 0;

export default async function TechnicianJobsQueue() {
  const db = await getDatabase();
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  let tech: any;
  if (userId) tech = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  if (!tech) tech = await db.collection('users').findOne({ role: 'TECHNICIAN' });
  if (!tech) throw new Error('Technician account not found');

  // Fetch Assigned Jobs
  const rawAssignedJobs = await db.collection('jobs').find({ technicianId: tech._id }).sort({ createdAt: -1 }).toArray();
  const assignedJobs = await Promise.all(
    rawAssignedJobs.map(async (job) => {
      const customer = await db.collection('users').findOne({ _id: job.customerId });
      const appliance = job.applianceId ? await db.collection('appliances').findOne({ _id: job.applianceId }) : null;
      return {
        ...job,
        status: job.status as string,
        createdAt: job.createdAt as Date,
        issueDescription: job.issueDescription as string,
        customerName: customer?.name || 'Unknown Customer',
        applianceName: appliance?.brand || 'Standard Appliance'
      } as any;
    })
  );

  // Fetch Open Market (Nearby/Out of Warranty) Jobs
  const rawMarketJobs = await db.collection('jobs').find({ status: 'PENDING', serviceOption: 'NEARBY_LOCAL_TECHNICIAN' }).sort({ createdAt: -1 }).toArray();
  
  // Strictly sanitize the data so Next.js doesn't complain about passing Objects to Client Components
  const marketJobs = await Promise.all(
    rawMarketJobs.map(async (job) => {
      const appliance = job.applianceId ? await db.collection('appliances').findOne({ _id: job.applianceId }) : null;
      return {
        _id: job._id.toString(), 
        applianceName: appliance?.brand || 'Appliance',
        issueDescription: job.issueDescription as string,
        location: job.location || null
      };
    })
  );

  const completedCount = assignedJobs.filter((j: any) => j.status === 'COMPLETED').length;
  const totalCount = assignedJobs.length;

  return (
    <main className="flex-1 pb-24 bg-white min-h-screen">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tech.name}`} alt="Avatar" className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200" />
            <div>
              <h1 className="text-base font-bold text-neutral-900 flex items-center gap-1">
                Hi, {tech.name.split(' ')[0]}! <span className="text-sm">👋</span>
              </h1>
              <p className="text-xs text-neutral-500">Manage your schedule</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <p className="text-xl font-bold text-neutral-900">{totalCount}</p>
            <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mt-1">Services</p>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <p className="text-xl font-bold text-neutral-900">{completedCount}</p>
            <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mt-1">Completed</p>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <p className="text-xl font-bold text-neutral-900">{tech.rating || '4.8'}</p>
            <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mt-1">Rating</p>
          </div>
        </div>
      </div>

      {/* Render the new GPS-powered Client Component */}
      <NearbyJobsClient jobs={marketJobs} techId={tech._id.toString()} />

      {/* Today's Schedule Timeline */}
      <div className="px-6 pt-6 mt-2">
        <h2 className="text-sm font-bold text-neutral-900 mb-6">Today's Schedule</h2>
        <div className="relative border-l-2 border-neutral-100 ml-3 space-y-8 pb-4">
          {assignedJobs.map((job: any) => {
            const isCompleted = job.status === 'COMPLETED';
            return (
              <div key={job._id.toString()} className="relative pl-6">
                <span className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-500 ring-emerald-100' : 'bg-amber-500 ring-amber-100'} ring-4`} />
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-neutral-900">{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <Badge status={isCompleted ? 'COMPLETED' : 'PENDING'} />
                </div>
                <Link href={`/prep/${job._id.toString()}`} className="block mt-2">
                  <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-soft flex items-center justify-between hover:border-neutral-300">
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.customerName}`} className="w-10 h-10 rounded-full border border-neutral-200" alt="Customer Initials" />
                      <div>
                        <h3 className="text-xs font-bold text-neutral-800">{job.customerName} <span className="text-neutral-400 font-normal"> • {job.applianceName}</span></h3>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{job.issueDescription.slice(0, 40)}...</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          {assignedJobs.length === 0 && <div className="pl-6 text-xs text-neutral-400 mt-4">No jobs assigned yet today.</div>}
        </div>
      </div>

      <TechBottomNav />
    </main>
  );
}