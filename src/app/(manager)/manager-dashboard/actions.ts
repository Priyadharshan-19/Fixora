'use server';

import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function dispatchJob(formData: FormData) {
  try {
    const jobId = formData.get('jobId') as string;
    const technicianId = formData.get('technicianId') as string;

    if (!jobId || !technicianId) {
      return { success: false, error: 'Please select a valid technician.' };
    }

    const db = await getDatabase();

    await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          technicianId: new ObjectId(technicianId),
          status: 'ASSIGNED',
          updatedAt: new Date()
        }
      }
    );

    revalidatePath('/manager-dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}