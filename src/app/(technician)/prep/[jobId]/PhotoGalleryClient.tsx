'use client';

import React, { useState } from 'react';
import { Camera, X, Maximize2 } from 'lucide-react';

export default function PhotoGalleryClient({ photos }: { photos: string[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm space-y-3">
      <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        <Camera size={14} className="text-neutral-500" /> Attached Customer Photos ({photos.length})
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer group shadow-sm hover:border-neutral-400 transition-all"
          >
            <img src={photo} alt={`Customer Attachment ${idx + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Overlay for High-Res View */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all z-10"
            >
              <X size={18} />
            </button>
            <div className="p-2 flex items-center justify-center min-h-[300px]">
              <img src={selectedPhoto} alt="Customer High-Res Attachment" className="max-h-[80vh] w-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}