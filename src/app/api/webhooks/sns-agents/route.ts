import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-fixora-secret');
    if (authHeader !== process.env.SNS_WEBHOOK_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized webhook caller' }, { status: 401 });
    }

    const payload = await request.json();
    const { agentType, data } = payload;
    const db = await getDatabase();

    switch (agentType) {
      case 'PREDICTIVE_INSIGHTS': {
        // Agent 2: Updates Job with pre-visit parts checklist and customer explanation
        const { jobId, techInsight, customerInsight, possibleParts } = data;
        await db.collection('jobs').updateOne(
          { _id: new ObjectId(jobId) },
          {
            $set: {
              'aiInsights.techInsight': techInsight,
              'aiInsights.customerInsight': customerInsight,
              'aiInsights.possibleParts': possibleParts,
              updatedAt: new Date(),
            },
          }
        );
        break;
      }

      case 'ANALYTICAL_SCORING': {
        // Agent 3: Updates Appliance with Manager Opportunity Score & Flag
        const { applianceId, opportunityScore, flagReason } = data;
        await db.collection('appliances').updateOne(
          { _id: new ObjectId(applianceId) },
          {
            $set: {
              opportunityScore: Number(opportunityScore),
              flagReason: flagReason,
              updatedAt: new Date(),
            },
          }
        );
        break;
      }

      default:
        return NextResponse.json({ success: false, error: 'Unrecognized agent type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Record updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}