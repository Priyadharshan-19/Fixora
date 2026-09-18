import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ServiceJob } from '@/types';
import { ObjectId } from 'mongodb';

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

// GET: Fetch single job details by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { jobId } = await context.params;
    const db = await getDatabase();

    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, error: 'Invalid Job ID format' }, { status: 400 });
    }

    const job = await db.collection<ServiceJob>('jobs').findOne({ _id: new ObjectId(jobId) });

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: State progression, dispatch assignments, and OTP verification
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { jobId } = await context.params;
    const db = await getDatabase();
    const body = await request.json();

    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, error: 'Invalid Job ID format' }, { status: 400 });
    }

    const { 
      status, 
      technicianId, 
      serviceDetails, 
      verifyOtp, 
      rating,
      verifyWarranty
    } = body;

    const currentJob = await db.collection<ServiceJob>('jobs').findOne({ _id: new ObjectId(jobId) });
    if (!currentJob) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    const updateDoc: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (verifyWarranty) {
      updateDoc.warrantyVerified = true;
      updateDoc.warrantyVerifiedAt = new Date();
      if (verifyWarranty.managerId) {
        updateDoc.warrantyVerifiedBy = new ObjectId(verifyWarranty.managerId);
      }
    }

    if (technicianId) {
      if (currentJob.hasWarranty && !currentJob.warrantyVerified && !verifyWarranty) {
        return NextResponse.json(
          { success: false, error: 'Warranty document must be verified before dispatching a technician.' },
          { status: 400 }
        );
      }
      updateDoc.technicianId = new ObjectId(technicianId);
    }

    if (status) {
      updateDoc.status = status;
    }

    if (serviceDetails) {
      updateDoc.serviceDetails = {
        ...currentJob.serviceDetails,
        ...serviceDetails,
      };
    }

    if (rating) {
      updateDoc.rating = {
        ...rating,
        submittedAt: new Date(),
      };
    }

    // OTP Handshake check for job completion
    if (verifyOtp !== undefined) {
      if (verifyOtp !== currentJob.otp) {
        return NextResponse.json(
          { success: false, error: 'Invalid OTP. Verification failed.' },
          { status: 400 }
        );
      }
      updateDoc.isOtpVerified = true;
      updateDoc.status = 'COMPLETED';
      updateDoc.completedAt = new Date();
    }

    await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { $set: updateDoc }
    );

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}