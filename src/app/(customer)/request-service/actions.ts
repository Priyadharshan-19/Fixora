'use server';

import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function createJobRequest(payload: {
  applianceName: string;
  issueDescription: string;
  hasWarranty: boolean;
  location: { lat: number; lng: number };
  photos?: string[]; // Array of Base64 image strings
}) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const db = await getDatabase();

    let customerId = userId ? new ObjectId(userId) : null;
    if (!customerId) {
      const seeded = await db.collection('users').findOne({ role: 'CUSTOMER' });
      customerId = seeded?._id || null; 
    }

    const newAppliance = await db.collection('appliances').insertOne({
      customerId: customerId,
      brand: payload.applianceName,
      category: 'CUSTOM_ENTRY',
      model: 'Custom',
      serialNumber: `SN-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date()
    });

    const routingOption = payload.hasWarranty
      ? 'AUTHORIZED_SERVICE_CENTER'
      : 'NEARBY_LOCAL_TECHNICIAN';

    const newJob = {
      customerId: customerId,
      applianceId: newAppliance.insertedId,
      issueDescription: payload.issueDescription,
      hasWarranty: payload.hasWarranty,
      serviceOption: routingOption,
      location: {
        customer: payload.location,
        technician: null
      },
      photos: payload.photos || [], // Saved customer photos array
      status: 'PENDING',
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('jobs').insertOne(newJob);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}