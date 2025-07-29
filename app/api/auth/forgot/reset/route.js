import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  await connectDB();
  const { userId, password } = await request.json();

  if (!userId || !password) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Find user by ID only (OTP was already verified in previous step)
  const user = await User.findById(userId);

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Update password and clear any reset tokens
  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return Response.json({ message: 'Password reset successful' });
}