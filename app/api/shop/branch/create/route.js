import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { Branch } from '@/models/Branch';

export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return Response.json({ error: 'Invalid token' }, { status: 401 });

    const { shopId, name, address } = await req.json();

    const shop = await Shop.findOne({ _id: shopId, owner: decoded.id });
    if (!shop) return Response.json({ error: 'Shop not found or access denied' }, { status: 404 });

    const branch = await Branch.create({
      name,
      address,
      shop: shop._id,
    });

    const branches = await Branch.find({ shop: shop._id });

    return Response.json({ success: true, branches });
  } catch (err) {
    return Response.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}
