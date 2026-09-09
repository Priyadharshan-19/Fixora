import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ServiceJob } from '@/types';
import { ObjectId } from 'mongodb';

// GET: Filter jobs by role, customerId, technicianId, or status
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);

    const customerId = searchParams.get('customerId');
    const technicianId = searchParams.get('technicianId');
    const status = searchParams.get('status');

    const query: Record<string, any> = {};

    if (customerId) query.customerId = new ObjectId(customerId);
    if (technicianId) query.technicianId = new ObjectId(technicianId);
    if (status) query.status = status;

    const jobs = await db
      .collection<ServiceJob>('jobs')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: jobs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST: Customer creates a new service job request
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    const { customerId, applianceId, issueDescription, serviceOption, urgency, location } = body;

    if (!customerId || !applianceId || !issueDescription || !location?.address) {
      return NextResponse.json(
        { success: false, error: 'Missing required service request fields' },
        { status: 400 }
      );
    }

    // Generate a secure 6-digit OTP for completion verification
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newJob: Omit<ServiceJob, '_id'> = {
      customerId: new ObjectId(customerId),
      applianceId: new ObjectId(applianceId),
      status: 'REQUESTED',
      urgency: urgency || 'MEDIUM',
      issueDescription,
      serviceOption: serviceOption || 'AUTHORIZED_SERVICE_CENTER',
      location,
      otp: generatedOtp,
      isOtpVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('jobs').insertOne(newJob);

    return NextResponse.json(
      {
        success: true,
        message: 'Service job registered successfully',
        jobId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}