'use server';

import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function submitTechnicianReview(jobId: string, rating: number, feedback: string) {
  try {
    const db = await getDatabase();
    const jobOid = new ObjectId(jobId);

    const job = await db.collection('jobs').findOne({ _id: jobOid });
    
    if (!job || !job.technicianId) {
      return { success: false, error: 'Job or technician not found.' };
    }
    
    if (job.review) {
      return { success: false, error: 'You have already reviewed this service.' };
    }

    // 1. Add the review directly into the job document
    await db.collection('jobs').updateOne(
      { _id: jobOid },
      { 
        $set: { 
          review: { rating, feedback, createdAt: new Date() } 
        } 
      }
    );

    // 2. Fetch all reviewed jobs for this specific technician to calculate the new average
    const reviewedJobs = await db.collection('jobs').find({
      technicianId: job.technicianId,
      'review.rating': { $exists: true }
    }).toArray();

    const totalStars = reviewedJobs.reduce((sum, j) => sum + j.review.rating, 0);
    const newAverage = (totalStars / reviewedJobs.length).toFixed(1);

    // 3. Update the technician's user profile with the new rating
    await db.collection('users').updateOne(
      { _id: job.technicianId },
      { 
        $set: { 
          rating: parseFloat(newAverage),
          totalReviews: reviewedJobs.length 
        } 
      }
    );

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}