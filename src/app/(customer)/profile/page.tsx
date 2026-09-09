import React from 'react';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { BottomNav } from '@/components/shared/BottomNav';
import { LogOut, Settings, Shield } from 'lucide-react';
import { logoutUser } from './actions';

export const revalidate = 0;

export default async function ProfilePage() {
  const db = await getDatabase();
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  let customer = null;
  if (userId) {
    customer = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  }
  if (!customer) {
    customer = await db.collection('users').findOne({ role: 'CUSTOMER' });
  }

  return (
    <main className="flex-1 pb-24 px-5 pt-8 bg-neutral-50/50 min-h-screen">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100 flex flex-col items-center mb-6 relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold mb-3 border-4 border-white shadow-sm relative z-10">
          {customer?.name?.slice(0, 2).toUpperCase() || 'CX'}
        </div>
        <h2 className="text-lg font-bold text-neutral-900 relative z-10">{customer?.name || 'Customer'}</h2>
        <p className="text-xs text-neutral-500 relative z-10">{customer?.email || 'customer@email.com'}</p>
        <div className="mt-3 bg-neutral-100 px-3 py-1 rounded-full text-[10px] font-bold text-neutral-600 uppercase tracking-widest relative z-10">
          {customer?.role || 'CUSTOMER'}
        </div>
      </div>

      <div className="space-y-3">
        {/* Settings Buttons */}
        <button className="w-full bg-white border border-neutral-100 rounded-2xl p-4 shadow-soft flex items-center justify-between hover:border-neutral-200 transition-all">
          <div className="flex items-center gap-3">
            <Settings size={18} className="text-neutral-400" />
            <span className="text-xs font-bold text-neutral-700">Account Settings</span>
          </div>
        </button>
        <button className="w-full bg-white border border-neutral-100 rounded-2xl p-4 shadow-soft flex items-center justify-between hover:border-neutral-200 transition-all">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-neutral-400" />
            <span className="text-xs font-bold text-neutral-700">Privacy & Security</span>
          </div>
        </button>
        
        {/* Secure Logout Button */}
        <form action={logoutUser}>
          <button type="submit" className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-soft flex items-center justify-between mt-6 hover:bg-rose-100 transition-all">
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-rose-600" />
              <span className="text-xs font-bold text-rose-600">Log Out</span>
            </div>
          </button>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}