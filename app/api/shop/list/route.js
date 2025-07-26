// app/api/shop/list/route.js
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';

export async function GET() {
  try {
    await connectDB();

    // ✅ Await cookies() in dynamic routes
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return Response.json({ error: 'Invalid token' }, { status: 401 });

    const shops = await Shop.find({ owner: decoded.id }).sort({ createdAt: -1 });

    return Response.json({ shops });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}
