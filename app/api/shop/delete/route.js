// app/api/shop/delete/route.js
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';

export async function DELETE(req) {
  try {
    await connectDB();
const cookieStore = await cookies(); // ✅ fixed
const token = cookieStore.get('accessToken')?.value;

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return Response.json({ error: 'Invalid token' }, { status: 401 });

    const { shopId } = await req.json();
    if (!shopId) return Response.json({ error: 'Shop ID is required' }, { status: 400 });

    const shop = await Shop.findOne({ _id: shopId });

    if (!shop || shop.owner.toString() !== decoded.id) {
      return Response.json({ error: 'Shop not found or unauthorized' }, { status: 403 });
    }

    await shop.deleteOne();

    return Response.json({ success: true, message: 'Shop deleted' });
  } catch (err) {
    return Response.json({ error: 'Shop deletion failed' }, { status: 500 });
  }
}
