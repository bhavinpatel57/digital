// app/api/auth/check-email/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { PendingUser } from '@/models/PendingUser';

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();

  // Check in both User and PendingUser collections
  const [existingUser, existingPending] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    PendingUser.findOne({ email: normalizedEmail })
  ]);

  return Response.json({ 
    available: !existingUser && !existingPending,
    isPending: !!existingPending,
    isRegistered: !!existingUser
  });
}