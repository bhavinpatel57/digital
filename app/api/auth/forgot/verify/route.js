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

  // Don't clear the token here - just return success
  return Response.json({ 
    message: 'OTP verified successfully',
    userId: user._id
  });
}