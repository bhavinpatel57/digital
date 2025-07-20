import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import crypto from 'crypto';

export async function POST(request) {
  await connectDB();
  const { userId, otp } = await request.json();
  const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    _id: userId,
    resetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });

  return Response.json({ message: 'OTP verified' });
}
