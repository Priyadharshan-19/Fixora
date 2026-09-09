'use server';

import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function updateTechnicianLocation(jobId: string, lat: number, lng: number) {
  const db = await getDatabase();
  await db.collection('jobs').updateOne(
    { _id: new ObjectId(jobId) },
    { $set: { 'location.technician': { lat, lng } } }
  );
}

export async function getLiveLocations(jobId: string) {
  const db = await getDatabase();
  const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
  
  return {
    customerLoc: job?.location?.customer || null,
    techLoc: job?.location?.technician || null,
  };
}