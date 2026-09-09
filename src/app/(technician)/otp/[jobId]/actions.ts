'use server';

import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function verifyJobOTP(jobId: string, inputOtp: string) {
  try {
    const db = await getDatabase();
    
    // Fetch the specific job
    const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
    
    if (!job) {
      return { success: false, error: 'Job record not found.' };
    }

    // Strictly check the OTP
    if (job.otp !== inputOtp) {
      return { success: false, error: 'Invalid OTP. Please ask the customer to check again.' };
    }

    // Update job to COMPLETED and verify OTP
    await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { 
        $set: { 
          status: 'COMPLETED', 
          isOtpVerified: true, 
          updatedAt: new Date() 
        } 
      }
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Server error verifying OTP.' };
  }
}