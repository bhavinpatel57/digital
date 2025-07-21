import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { getUserFromToken } from '@/utils/token';

export async function POST(req) {
  await connectDB();

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = getUserFromToken(token);
  if (!userData?.id) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { password } = await req.json();
  if (!password || password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const user = await User.findById(userData.id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.provider !== 'google' || user.password) {
    return Response.json({ error: 'Password already set or not a Google account' }, { status: 400 });
  }

  user.password = await bcrypt.hash(password, 12);
  user.provider = 'both'; // now supports both Google + password
  await user.save();

  return Response.json({ message: 'Password set successfully' });
}
