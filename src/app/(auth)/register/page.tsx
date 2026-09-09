'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { registerUser } from './actions';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'TECHNICIAN' | 'MANAGER'>('CUSTOMER');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('role', selectedRole); // Inject the selected role into the form data

    const result = await registerUser(formData);

    if (result.success) {
      // Route to the correct dashboard based on the classified role
      if (result.role === 'TECHNICIAN') {
        router.push('/jobs');
      } else if (result.role === 'MANAGER') {
        router.push('/manager-dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Failed to create account.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center px-6 py-12 bg-white min-h-screen">
      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1 flex items-center gap-2">
          Create Account <span className="text-xl">🚀</span>
        </h1>
        <p className="text-sm text-neutral-500">Join Fixora today</p>
      </div>

      <form onSubmit={handleRegister} className="w-full space-y-4">
        
        {/* Role Classification Selector */}
        <div className="space-y-2 mb-2">
          <label className="text-xs font-semibold text-neutral-700">I am a...</label>
          <div className="grid grid-cols-3 gap-2">
            {['CUSTOMER', 'TECHNICIAN', 'MANAGER'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role as any)}
                className={`py-2.5 text-[11px] font-bold rounded-xl border transition-all ${
                  selectedRole === role
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-neutral-900 focus:bg-white transition-all placeholder:text-neutral-400"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-neutral-900 focus:bg-white transition-all placeholder:text-neutral-400"
            required
          />
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-neutral-900 focus:bg-white transition-all placeholder:text-neutral-400"
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-semibold text-neutral-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-neutral-900 focus:bg-white transition-all placeholder:text-neutral-400 tracking-widest"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 p-3 rounded-xl mt-2">
            <AlertTriangle size={14} />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-4 bg-neutral-900 text-white py-4 rounded-2xl text-sm font-bold shadow-elevated hover:bg-black disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-neutral-900 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}