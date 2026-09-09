'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { loginUser } from './actions';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);

    if (result.success) {
      // Route to the correct dashboard based on DB role
      if (result.role === 'TECHNICIAN') {
        router.push('/jobs');
      } else if (result.role === 'MANAGER') {
        router.push('/manager-dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Login failed.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center px-6 py-12 bg-white min-h-screen">
      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1 flex items-center gap-2">
          Welcome Back! <span className="text-xl">👋</span>
        </h1>
        <p className="text-sm text-neutral-500">Login to your account</p>
      </div>

      <form onSubmit={handleLogin} className="w-full space-y-4">
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
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-neutral-700">Password</label>
            <Link href="#" className="text-[10px] text-neutral-500 hover:text-neutral-900">Forgot?</Link>
          </div>
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

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-1 pb-2">
          <input type="checkbox" id="remember" className="rounded text-neutral-900 focus:ring-neutral-900" />
          <label htmlFor="remember" className="text-xs text-neutral-600 cursor-pointer">Remember me</label>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 p-3 rounded-xl">
            <AlertTriangle size={14} />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-neutral-900 text-white py-4 rounded-2xl text-sm font-bold shadow-elevated hover:bg-black disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Authenticating...' : 'Login'}
        </button>
      </form>

      {/* Social Logins */}
      <div className="mt-8 relative flex items-center justify-center">
        <hr className="w-full border-neutral-100" />
        <span className="absolute bg-white px-3 text-[10px] text-neutral-400 uppercase tracking-wider">or continue with</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button type="button" className="py-3 border border-neutral-200 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
          <span className="text-xs font-bold text-neutral-700">Google</span>
        </button>
        <button type="button" className="py-3 border border-neutral-200 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors">
          <img src="https://www.svgrepo.com/show/448234/apple.svg" alt="Apple" className="w-4 h-4" />
          <span className="text-xs font-bold text-neutral-700">Apple</span>
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-neutral-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}