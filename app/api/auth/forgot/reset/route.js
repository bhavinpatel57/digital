import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  await connectDB();
  const { userId, password } = await request.json();

  if (!userId || !password) {
    return Response.json({ error: 'Missing userId or password' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const isGoogleUserWithoutPassword = user.provider === 'google' && !user.password;

  // For non-Google users or Google users who already have a password,
  // require a valid reset token
  if (!isGoogleUserWithoutPassword) {
    if (
      !user.resetTokenExpires ||
      user.resetTokenExpires < Date.now() ||
      !user.resetToken
    ) {
      return Response.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }
  }

  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;

  // Clear reset fields only if they were required
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  // Optionally mark provider as 'both' if Google user sets password
  if (isGoogleUserWithoutPassword) {
    user.provider = 'both';
  }

  await user.save();

  return Response.json({ message: 'Password reset successful' });
}
