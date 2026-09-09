'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobRequest } from './actions';
import { Camera, X, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RequestServicePage() {
  const router = useRouter();
  const [applianceName, setApplianceName] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [hasWarranty, setHasWarranty] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      alert('You can upload a maximum of 3 photos.');
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be under 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applianceName.trim() || !issueDescription.trim()) return;

    setIsSubmitting(true);

    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      setIsSubmitting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const customerLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const res = await createJobRequest({
          applianceName,
          issueDescription,
          hasWarranty,
          location: customerLocation,
          photos
        });

        if (res.success) {
          router.push('/dashboard');
          router.refresh();
        } else {
          alert(`Failed to submit request: ${res.error}`);
          setIsSubmitting(false);
        }
      },
      (error) => {
        alert('Please allow location access to request a technician.');
        setIsSubmitting(false);
      },
      // Added high accuracy and timeout limits for better mobile reliability
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col max-w-md mx-auto border-x border-neutral-100 shadow-sm relative">
      <header className="bg-white px-5 py-4 border-b border-neutral-100 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/dashboard" className="p-2 -ml-2 text-neutral-700 hover:text-black transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-sm font-bold text-neutral-900">Request Service</h1>
          <p className="text-[10px] text-neutral-500 font-medium">Describe your appliance issue</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-5 space-y-6 flex-1 bg-white">
        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
            Appliance & Model
          </label>
          <input
            type="text"
            required
            value={applianceName}
            onChange={(e) => setApplianceName(e.target.value)}
            placeholder="e.g. LG Front Load Washing Machine"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
            Issue Description
          </label>
          <textarea
            required
            rows={3}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Describe the symptoms or error codes..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors resize-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex justify-between mb-2">
            <span>Attach Photos</span>
            <span className="text-neutral-300">{photos.length}/3</span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-sm">
                <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm">
                <Camera size={20} className="text-neutral-400 mb-1" />
                <span className="text-[10px] font-bold text-neutral-500">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-neutral-800">Under Active Warranty?</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Routes to authorized service center</p>
          </div>
          <input
            type="checkbox"
            checked={hasWarranty}
            onChange={(e) => setHasWarranty(e.target.checked)}
            className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-neutral-900 text-white py-3.5 rounded-xl text-xs font-bold shadow-md hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting Request...
            </>
          ) : (
            'Submit Service Request'
          )}
        </button>
      </form>
    </main>
  );
}