import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { Branch } from '@/models/Branch';
import { Shop } from '@/models/Shop';

export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return Response.json({ error: 'Invalid token' }, { status: 401 });

    const { shopId, branchId, name, address } = await req.json();

    const shop = await Shop.findOne({ _id: shopId, owner: decoded.id });
    if (!shop) return Response.json({ error: 'Shop not found or access denied' }, { status: 404 });

    const branch = await Branch.findOneAndUpdate(
      { _id: branchId, shop: shop._id },
      { name, address },
      { new: true }
    );

    const branches = await Branch.find({ shop: shop._id });

    return Response.json({ success: true, branches });
  } catch (err) {
    return Response.json({ error: 'Failed to edit branch' }, { status: 500 });
  }
}
