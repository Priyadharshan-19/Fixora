'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobRequest } from './actions';
import { Camera, X, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const compressImage = (file: File, maxDim = 1000, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) resolve(reader.result as string);
      else reject(new Error('Failed to read file'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function RequestServicePage() {
  const router = useRouter();
  const [applianceName, setApplianceName] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyDoc, setWarrantyDoc] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      alert('You can upload a maximum of 3 photos.');
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be under 5MB');
        continue;
      }

      try {
        const compressed = await compressImage(file);
        setPhotos((prev) => [...prev, compressed]);
      } catch {
        alert('Failed to process image, please try another photo.');
      }
    }

    e.target.value = '';
  };

  const handleWarrantyDocSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be under 5MB');
      return;
    }

    try {
      const isPdf = file.type === 'application/pdf';
      const result = isPdf ? await readFileAsDataUrl(file) : await compressImage(file);
      setWarrantyDoc(result);
    } catch {
      alert('Failed to process the warranty document, please try again.');
    }

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applianceName.trim() || !issueDescription.trim()) return;

    if (hasWarranty && !warrantyDoc) {
      alert('Please attach your warranty document to proceed.');
      return;
    }

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
          warrantyDoc,
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
    <main className="min-h-screen bg-neutral-50 md:py-10">
      
      {/* w-full added here to span mobile screens, with max-w-md constraints for desktop */}
      <div className="w-full max-w-md mx-auto bg-white min-h-screen md:min-h-[800px] md:rounded-3xl shadow-xl border-x md:border border-neutral-100 flex flex-col relative overflow-hidden">
        
        <header className="bg-white/90 backdrop-blur-md px-5 py-4 border-b border-neutral-100 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <Link href="/dashboard" className="p-2 -ml-2 text-neutral-700 hover:text-black transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-neutral-900">Request Service</h1>
            <p className="text-[10px] text-neutral-500 font-medium">Describe your appliance issue</p>
          </div>
        </header>

        {/* Form is a flex column so the button can push to the bottom automatically */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6 flex-1 bg-white">
          
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

          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-800">Under Active Warranty?</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Routes to authorized service center</p>
              </div>
              <input
                type="checkbox"
                checked={hasWarranty}
                onChange={(e) => {
                  setHasWarranty(e.target.checked);
                  if (!e.target.checked) setWarrantyDoc(null);
                }}
                className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
              />
            </div>
            
            {hasWarranty && (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Warranty Document
                </label>
                {warrantyDoc ? (
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
                    {warrantyDoc.startsWith('data:application/pdf') ? (
                      <div className="flex items-center gap-2 p-3 text-xs font-semibold text-neutral-700">
                        📄 Warranty PDF attached
                      </div>
                    ) : (
                      <img src={warrantyDoc} alt="Warranty document" className="w-full h-32 object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setWarrantyDoc(null)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-white cursor-pointer transition-all">
                    <Camera size={18} className="text-neutral-400 mb-1" />
                    <span className="text-[10px] font-bold text-neutral-500">Attach Warranty Proof</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleWarrantyDocSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* mt-auto pushes the submit button to the bottom of the screen */}
          <div className="mt-auto pt-4 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl text-xs font-bold shadow-md hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
          
        </form>
      </div>
    </main>
  );
}