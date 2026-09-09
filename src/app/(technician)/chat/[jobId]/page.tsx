import React from 'react';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import ChatClient from './ChatClient';

export default async function AiCoPilotPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const db = await getDatabase();
  
  // Fetch real job data
  const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
  
  if (!job) {
    return <div className="p-6 text-center mt-20">Job not found.</div>;
  }

  // Fetch real appliance data
  const appliance = job.applianceId 
    ? await db.collection('appliances').findOne({ _id: job.applianceId }) 
    : null;
    
  const applianceName = appliance?.brand || 'Appliance';

  return (
    <ChatClient 
      jobId={jobId} 
      applianceName={applianceName} 
      issueDescription={job.issueDescription} 
    />
  );
}