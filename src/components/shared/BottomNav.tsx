'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, PlusCircle, User, Bell } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white border-t border-gray-100 h-[68px] flex items-center justify-evenly px-2 pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.03)] relative">
        
        {/* Slot 1: Home */}
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 transition-colors w-14 ${pathname === '/dashboard' ? 'text-neutral-950 font-medium' : 'text-gray-400 hover:text-gray-600'}`}>
          <Home size={22} strokeWidth={pathname === '/dashboard' ? 2.2 : 1.8} />
          <span className="text-[10px]">Home</span>
        </Link>
        
        {/* Slot 2: History */}
        <Link href="/history" className={`flex flex-col items-center gap-1 transition-colors w-14 ${pathname === '/history' ? 'text-neutral-950 font-medium' : 'text-gray-400 hover:text-gray-600'}`}>
          <FileText size={22} strokeWidth={pathname === '/history' ? 2.2 : 1.8} />
          <span className="text-[10px]">History</span>
        </Link>
        
        {/* Slot 3: Exact Center FAB (Floating Action Button) */}
        <div className="w-14 h-full flex justify-center">
          <Link href="/request-service" className="absolute -top-5 flex items-center justify-center w-[52px] h-[52px] bg-neutral-900 text-white rounded-full shadow-lg hover:bg-black hover:scale-105 transition-all border-4 border-white">
            <PlusCircle size={24} strokeWidth={1.5} />
          </Link>
        </div>
        
        {/* Slot 4: Alerts (Added to balance the flex layout) */}
        <Link href="/notifications" className={`flex flex-col items-center gap-1 transition-colors w-14 ${pathname === '/notifications' ? 'text-neutral-950 font-medium' : 'text-gray-400 hover:text-gray-600'}`}>
          <Bell size={22} strokeWidth={pathname === '/notifications' ? 2.2 : 1.8} />
          <span className="text-[10px]">Alerts</span>
        </Link>

        {/* Slot 5: Profile */}
        <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors w-14 ${pathname === '/profile' ? 'text-neutral-950 font-medium' : 'text-gray-400 hover:text-gray-600'}`}>
          <User size={22} strokeWidth={pathname === '/profile' ? 2.2 : 1.8} />
          <span className="text-[10px]">Profile</span>
        </Link>

      </div>
    </div>
  );
};