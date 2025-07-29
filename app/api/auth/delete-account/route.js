// app/api/auth/delete-account/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getUserFromToken } from '@/utils/token';
import { cookies } from 'next/headers';

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

  const { password } = await request.json();
  const user = await User.findById(userData.id);

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // For password-based accounts, verify password
  if (user.password) {
    if (!password) {
      return Response.json({ error: 'Password is required' }, { status: 400 });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ error: 'Incorrect password' }, { status: 400 });
    }
  }

  // Delete user
  await User.deleteOne({ _id: userData.id });

  // Clear cookies
  const cookieStore = await cookies();
  cookieStore.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  cookieStore.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 0,
  });

  return Response.json({ message: 'Account deleted successfully' });
}