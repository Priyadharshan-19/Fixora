import React from 'react';
import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { WashingMachine } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { BottomNav } from '@/components/shared/BottomNav';

export const revalidate = 0;

export default async function HistoryPage() {
  const db = await getDatabase();
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  let query = {};
  if (userId) {
    query = { customerId: new ObjectId(userId) };
  } else {
    // Fallback if seeded directly
    const seeded = await db.collection('users').findOne({ role: 'CUSTOMER' });
    if (seeded) query = { customerId: seeded._id };
  }

  const jobs = await db.collection('jobs').find(query).sort({ createdAt: -1 }).toArray();

  return (
    <main className="flex-1 pb-24 px-5 pt-8 bg-neutral-50/50 min-h-screen">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">Service History</h1>
      
      <div className="flex flex-col gap-3">
        {jobs.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center mt-10">No service history found.</p>
        ) : (
          jobs.map(job => (
            <Link 
              key={job._id.toString()} 
              href={job.status !== 'COMPLETED' ? `/track/${job._id.toString()}` : '#'} 
              className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-soft block hover:border-neutral-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-600 border border-neutral-100">
                    <WashingMachine size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-800">{job.issueDescription.slice(0, 25)}...</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge status={job.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'} label={job.status.replace('_', ' ')} />
              </div>
            </Link>
          ))
        )}
      </div>
      <BottomNav />
    </main>
  );
}