'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { MapPin, Navigation, AlertTriangle, Loader2 } from 'lucide-react';
import { claimOpenMarketJob } from './actions';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export default function NearbyJobsClient({ jobs, techId }: { jobs: any[], techId: string }) {
  const [techLocation, setTechLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'denied' | 'error'>('loading');
  
  // React's strict hook for Server Actions
  const [isPending, startTransition] = useTransition();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('geolocation' in navigator)) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTechLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('success');
      },
      (err) => {
        if (err.code === 1) setLocationStatus('denied');
        else setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleClaim = (jobId: string) => {
    setClaimingId(jobId);
    
    // startTransition safely wraps the Server Action network request
    startTransition(async () => {
      try {
        await claimOpenMarketJob(jobId, techId);
      } catch (err) {
        alert("Failed to claim job. Check your network.");
      } finally {
        setClaimingId(null);
      }
    });
  };

  if (jobs.length === 0) return null;

  const sortedJobs = [...jobs].sort((a, b) => {
    if (!techLocation || !a.location?.customer || !b.location?.customer) return 0;
    const distA = calculateDistance(techLocation.lat, techLocation.lng, a.location.customer.lat, a.location.customer.lng);
    const distB = calculateDistance(techLocation.lat, techLocation.lng, b.location.customer.lat, b.location.customer.lng);
    return distA - distB;
  });

  return (
    <div className="px-6 pt-4 pb-2 mt-2 bg-emerald-50/50 border-y border-emerald-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
          <MapPin size={16} /> Open Market Jobs
        </h2>
        
        {locationStatus === 'loading' && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <Loader2 size={12} className="animate-spin" /> Locating...
          </span>
        )}
        {locationStatus === 'denied' && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
            <AlertTriangle size={10} /> Location Disabled
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {sortedJobs.map((job) => {
          let distanceStr = 'Distance unknown';
          
          if (locationStatus === 'success' && techLocation && job.location?.customer) {
            const dist = calculateDistance(techLocation.lat, techLocation.lng, job.location.customer.lat, job.location.customer.lng);
            distanceStr = `${dist.toFixed(1)} km away`;
          } else if (locationStatus === 'denied') {
            distanceStr = 'Enable GPS for distance';
          }

          const isThisJobClaiming = claimingId === job._id || (isPending && claimingId === job._id);

          return (
            <div key={job._id} className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm flex items-center justify-between transition-all hover:border-emerald-300">
              <div>
                <h3 className="text-xs font-bold text-neutral-800">{job.applianceName} Repair</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">{job.issueDescription.slice(0, 30)}...</p>
                
                <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-bold inline-flex px-2 py-0.5 rounded-full border ${
                  locationStatus === 'success' ? 'text-emerald-700 bg-emerald-100/50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                   <Navigation size={10} />
                   {distanceStr}
                </div>
              </div>
              
              <button 
                onClick={() => handleClaim(job._id)}
                disabled={isPending}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all min-w-[90px] flex justify-center"
              >
                {isThisJobClaiming ? <Loader2 size={16} className="animate-spin" /> : 'Claim Job'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}