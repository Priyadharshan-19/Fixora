'use server';

import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function dispatchJob(formData: FormData) {
  try {
    const jobId = formData.get('jobId') as string;
    const technicianId = formData.get('technicianId') as string;

    if (!jobId || !technicianId) {
      return { success: false, error: 'Please select a valid technician.' };
    }

    const db = await getDatabase();

    // Guard: block dispatch on unverified warranty jobs
    const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
    if (job?.hasWarranty && !job?.warrantyVerified) {
      return { success: false, error: 'Warranty document must be verified before dispatching.' };
    }

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

export async function verifyWarranty(formData: FormData) {
  try {
    const jobId = formData.get('jobId') as string;

    if (!jobId) {
      return { success: false, error: 'Missing job ID.' };
    }

    const db = await getDatabase();

    const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
    if (!job?.warrantyDocUrl) {
      return { success: false, error: 'No warranty document attached to verify.' };
    }

    // TODO: replace with the logged-in manager's real user ID once auth/session is wired to this page
    const cookieStore = await cookies();
    const managerId = cookieStore.get('userId')?.value;

    await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          warrantyVerified: true,
          warrantyVerifiedAt: new Date(),
          ...(managerId ? { warrantyVerifiedBy: new ObjectId(managerId) } : {}),
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