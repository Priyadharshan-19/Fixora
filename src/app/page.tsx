import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between max-w-md mx-auto p-6 relative">
      
      {/* Top Section - Perfectly Centered */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
        
        {/* FIXORA Logo - Increased size so the text inside is readable */}
        <div className="mb-10">
          <Image
            src="/images/logo.png"
            alt="Fixora Logo"
            width={140}
            height={140}
            className="w-32 h-32 rounded-3xl shadow-sm object-contain"
            priority
          />
        </div>

        <h1 className="text-4xl font-extrabold text-neutral-900 mb-4 text-center leading-tight tracking-tight">
          Service
          <br />
          Made Simple
        </h1>

        <p className="text-neutral-500 text-center text-base max-w-[280px] mx-auto leading-relaxed">
          Track, manage, and get all your service in one application.
        </p>

      </div>

      {/* Bottom Action Section */}
      <div className="w-full pb-8">
        
        {/* Get Started Button */}
        <Link href="/login" className="block w-full mb-6">
          <Button fullWidth className="py-4 text-base font-bold rounded-2xl shadow-md">
            Get Started
          </Button>
        </Link>

        {/* Secondary Link */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            I already have an account
          </Link>
        </div>

      </div>

    </main>
  );
}