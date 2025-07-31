// app/api/auth/forgot/verify/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import crypto from 'crypto';

export async function POST(request) {
  await connectDB();

  const { userId, otp } = await request.json();
  if (!userId || !otp) {
    return Response.json({ error: 'Missing OTP or user ID' }, { status: 400 });
  }

  const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    _id: userId,
    resetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }

  // Clear the reset token but don't save yet (will be saved in reset step)
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return Response.json({ 
    message: 'OTP verified successfully',
    userId: user._id,
    verified: true
  });
}