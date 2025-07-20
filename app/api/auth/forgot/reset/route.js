import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  await connectDB();
  const { userId, password } = await request.json();

  const user = await User.findById(userId);
  if (!user || !user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
    return Response.json({ error: 'Invalid or expired reset' }, { status: 400 });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return Response.json({ message: 'Password reset successful' });
}
