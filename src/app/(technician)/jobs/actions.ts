'use server';

import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function claimOpenMarketJob(jobId: string, techId: string) {
  try {
    const db = await getDatabase();
    await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { 
        $set: { 
          technicianId: new ObjectId(techId), 
          status: 'ASSIGNED', 
          updatedAt: new Date() 
        } 
      }
    );
    
    // Refresh the page data instantly
    revalidatePath('/jobs');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}