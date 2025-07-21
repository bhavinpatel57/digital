import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies(); // ✅ Await this
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user });
  } catch (err) {
    console.error('❌ /api/auth/me error:', err);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
