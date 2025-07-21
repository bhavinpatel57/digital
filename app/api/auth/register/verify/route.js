import { connectDB } from '@/lib/db';
import { PendingUser } from '@/models/PendingUser';
import { User } from '@/models/User';
import crypto from 'crypto';

export async function POST(request) {
  await connectDB();

  const { userId, otp } = await request.json();
  if (!userId || !otp) {
    return Response.json({ error: 'Missing OTP or user ID' }, { status: 400 });
  }

  const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

  const pending = await PendingUser.findOne({
    _id: userId,
    emailVerifyToken: hashedToken,
    emailVerifyTokenExpires: { $gt: Date.now() },
  }).select('email name password'); // only select needed fields

  if (!pending) {
    return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }

  const newUser = await User.create({
    email: pending.email.toLowerCase(),
    password: pending.password,
    name: pending.name,
    provider: 'credentials',
    isVerified: true,
  });

  await PendingUser.deleteOne({ _id: userId });

  return Response.json({
    message: 'User created successfully',
    userId: newUser._id,
  });
}
