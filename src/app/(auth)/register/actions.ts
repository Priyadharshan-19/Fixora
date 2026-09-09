'use server';

import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!name || !phone || !email || !password || !role) {
      return { success: false, error: 'All fields are required.' };
    }

    const db = await getDatabase();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return { success: false, error: 'Email already exists. Please login.' };
    }

    const newUser = {
      name,
      phone,
      email,
      password,
      role,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    // Save the new user's ID into a secure browser cookie
    const cookieStore = await cookies();
    cookieStore.set('userId', result.insertedId.toString(), { path: '/' });
    cookieStore.set('userRole', role, { path: '/' });

    return { success: true, role };
  } catch (error: any) {
    return { success: false, error: error.message || 'Server error during registration.' };
  }
}