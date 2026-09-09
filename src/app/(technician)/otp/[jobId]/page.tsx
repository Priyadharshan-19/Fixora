'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { verifyJobOTP } from './actions';

export default function OTPVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move focus to previous input
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 4) {
      setError('Please enter all 4 digits.');
      return;
    }

    setIsVerifying(true);
    setError('');

    const result = await verifyJobOTP(jobId, code);

    if (result.success) {
      setSuccess(true);
      // Wait a moment to show the success state, then route to the Job Queue
      setTimeout(() => {
        router.push('/jobs');
      }, 1500);
    } else {
      setError(result.error || 'Verification failed.');
      setIsVerifying(false);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <main className="flex-1 bg-white min-h-screen flex flex-col">
      <header className="px-5 py-4 flex items-center border-b border-neutral-100">
        <Link href={`/chat/${jobId}`} className="p-2 -ml-2 text-neutral-700 hover:text-black bg-neutral-50 rounded-full">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-sm font-bold text-neutral-900 ml-3">Close Job</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {success ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Job Completed!</h2>
            <p className="text-sm text-neutral-500">The customer's OTP was verified successfully.</p>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className="w-16 h-16 bg-neutral-50 border border-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm">
              <ShieldCheck size={32} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Secure Verification</h2>
            <p className="text-xs text-neutral-500 mb-8 leading-relaxed">
              To officially close this request, please ask the customer for the 4-digit secure OTP located on their tracking dashboard.
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all focus:outline-none ${
                    error ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-neutral-900 focus:bg-white'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-rose-600 mb-6 bg-rose-50 py-2 px-3 rounded-lg">
                <AlertTriangle size={14} />
                <p className="text-[11px] font-bold">{error}</p>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={isVerifying || otp.join('').length !== 4}
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold shadow-elevated hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isVerifying ? 'Verifying...' : 'Verify & Complete Job'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}