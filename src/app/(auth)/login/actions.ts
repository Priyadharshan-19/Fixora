'use server';

import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function loginUser(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const db = await getDatabase();

    // 1. Find the user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }

    // 2. Verify password (matches exactly what was saved during registration)
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    // 3. Set the secure session cookies so the Dashboard knows who is logged in
    const cookieStore = await cookies();
    cookieStore.set('userId', user._id.toString(), { path: '/' });
    cookieStore.set('userRole', user.role, { path: '/' });

    return { success: true, role: user.role };
  } catch (error: any) {
    return { success: false, error: error.message || 'Server error during login.' };
  }
}