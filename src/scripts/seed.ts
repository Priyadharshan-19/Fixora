// src/scripts/seed.ts
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Force the script to read .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'fixora_db';

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is missing in .env.local');
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log('Clearing existing records...');
  await db.collection('users').deleteMany({});
  await db.collection('appliances').deleteMany({});
  await db.collection('jobs').deleteMany({});

  console.log('Seeding Users...');
  const customerId = new ObjectId();
  const techId = new ObjectId();
  const managerId = new ObjectId();

  await db.collection('users').insertMany([
    {
      _id: customerId,
      name: 'Leonard Hofstadter',
      email: 'leonard@example.com',
      phone: '+1 987 654 3210',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: techId,
      name: 'John Deo',
      email: 'john.deo@fixora.com',
      phone: '+1 987 654 3211',
      role: 'TECHNICIAN',
      skills: ['Washing Machine', 'Refrigerator', 'HVAC'],
      isAvailable: true,
      rating: 4.8,
      completedJobsCount: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: managerId,
      name: 'Sarah Connor',
      email: 'sarah.c@fixora.com',
      phone: '+1 987 654 3212',
      role: 'MANAGER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('Seeding Appliances...');
  const applianceId = new ObjectId();

  await db.collection('appliances').insertOne({
    _id: applianceId,
    customerId,
    category: 'WASHING_MACHINE',
    brand: 'LG',
    model: 'Front Load AI Direct Drive 8kg',
    serialNumber: 'LGWM-2024-88391',
    purchaseDate: new Date('2022-03-15'),
    warrantyExpiry: new Date('2024-03-15'),
    replacementValue: 750,
    serviceHistory: [
      {
        date: new Date('2023-08-10'),
        type: 'ROUTINE_CHECKUP',
        cost: 60,
        notes: 'Belt alignment and filter cleaning',
      },
      {
        date: new Date('2024-01-18'),
        type: 'REPAIR',
        cost: 140,
        notes: 'Water inlet valve replacement',
      },
    ],
    opportunityScore: 0,
    flagReason: 'NONE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Seeding Active Job...');
  await db.collection('jobs').insertOne({
    customerId,
    technicianId: techId,
    applianceId,
    status: 'IN_PROGRESS',
    urgency: 'HIGH',
    issueDescription:
      'Washer not spinning and making loud vibration noise during high spin cycle',
    serviceOption: 'AUTHORIZED_SERVICE_CENTER',
    location: {
      address: '423 Elm Street, Apt 4B',
      city: 'Metro City',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    aiInsights: {
      techInsight:
        'Likely suspension rod or drive bearing degradation based on previous repair frequency.',
      customerInsight:
        'The technician will inspect the suspension dampening struts and drum stability.',
      possibleParts: [
        'Shock Absorber Kit',
        'Drum Bearing Assembly',
        'Leveling Pads',
      ],
    },
    serviceDetails: {
      issueFound:
        'Damaged rear shock absorber causing violent drum wobble.',
      repairsDone:
        'Replaced dual dampers and realigned drum balance.',
      partsReplaced: [
        {
          partName: 'Shock Absorber Kit (Set of 2)',
          partNumber: 'LG-SA-402',
          cost: 65,
        },
        {
          partName: 'Heavy-Duty Valve Grommet',
          partNumber: 'LG-VG-10',
          cost: 15,
        },
      ],
      finalApplianceCondition: 'FAIR',
      observations:
        'Appliance is nearing end of warranty lifecycle. Motor assembly is intact but show signs of rotor wear.',
    },
    otp: '4821',
    isOtpVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Database seeded successfully!');
  await client.close();
}

seed().catch(console.error);