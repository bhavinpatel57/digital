// app/api/auth/change-password/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { getUserFromToken } from '@/utils/token';

export async function POST(request) {
  await connectDB();

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = getUserFromToken(token);
  if (!userData?.id) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();
  
  if (!currentPassword || !newPassword) {
    return Response.json({ error: 'Both current and new password are required' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const user = await User.findById(userData.id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  // Update password
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return Response.json({ message: 'Password changed successfully' });
}