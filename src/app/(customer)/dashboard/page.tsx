import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import {
  Bell,
  ChevronRight,
  WashingMachine,
  Refrigerator,
} from 'lucide-react';
import { getDatabase } from '@/lib/mongodb';
import { Badge } from '@/components/ui/Badge';
import { BottomNav } from '@/components/shared/BottomNav';

export const revalidate = 0; // Ensures fresh data per page request

export default async function CustomerDashboardPage() {
  const db = await getDatabase();

  // 1. Read the logged-in user's ID from the cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  let customer;

  // 2. Fetch the customer using the exact logged-in user ID
  if (userId && ObjectId.isValid(userId)) {
    customer = await db.collection('users').findOne({
      _id: new ObjectId(userId),
    });
  }

  // 3. Fallback to seeded customer data if no valid cookie is found
  if (!customer) {
    customer = await db.collection('users').findOne({
      role: 'CUSTOMER',
    });
  }

  if (!customer) {
    throw new Error('Customer account not found');
  }

  // 4. Fetch appliances belonging specifically to this customer
  const appliances = await db
    .collection('appliances')
    .find({ customerId: customer._id })
    .toArray();

  // 5. Fetch recent jobs belonging specifically to this customer
  const recentServices = await db
    .collection('jobs')
    .find({ customerId: customer._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  return (
    <main className="flex-1 pb-24 px-5 pt-8 bg-neutral-50/50">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-sm">
            {customer.name.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-base font-semibold text-neutral-900">
                Hi, {customer.name.split(' ')[0]}
              </h1>
              <span className="text-sm">👋</span>
            </div>

            <p className="text-xs text-neutral-400">
              Welcome to your care portal
            </p>
          </div>
        </div>

        <button
          aria-label="Notifications"
          className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-neutral-600 shadow-soft"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* Dynamic Registered Appliances */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-semibold text-neutral-900">
            Your Appliances
          </h2>

          <Link
            href="/history"
            className="text-xs text-neutral-400 hover:text-neutral-700"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {appliances.map((app) => (
            <Link
              key={app._id.toString()}
              href={`/appliances/${app._id.toString()}`}
              className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-center justify-between shadow-soft hover:border-neutral-200 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-700 border border-neutral-100">
                  {app.category === 'WASHING_MACHINE' ? (
                    <WashingMachine size={22} />
                  ) : (
                    <Refrigerator size={22} />
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-neutral-800">
                    {app.brand} {app.category.replace('_', ' ')}
                  </h3>

                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {app.model}
                  </p>

                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    S/N: {app.serialNumber}
                  </p>
                </div>
              </div>

              <ChevronRight size={16} className="text-neutral-300" />
            </Link>
          ))}
        </div>
      </section>

      {/* Dynamic Job Tracker */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-semibold text-neutral-900">
            Recent Services
          </h2>

          <Link
            href="/history"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            See All
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {recentServices.map((job) => (
            <Link
              key={job._id.toString()}
              href={
                job.status !== 'COMPLETED'
                  ? `/track/${job._id.toString()}`
                  : `/history`
              }
              className="block bg-white border border-neutral-100 rounded-2xl p-4 shadow-soft hover:border-neutral-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-600 border border-neutral-100">
                    <WashingMachine size={18} />
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-neutral-800">
                      {job.issueDescription.slice(0, 26)}...
                    </h3>

                    <p className="text-[11px] text-neutral-400">
                      Created:{' '}
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Badge
                  status={
                    job.status === 'COMPLETED'
                      ? 'COMPLETED'
                      : 'IN_PROGRESS'
                  }
                  label={job.status.replace('_', ' ')}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}