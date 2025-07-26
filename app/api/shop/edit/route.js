// app/api/shop/edit/route.js
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';

export async function PUT(req) {
  try {
    await connectDB();
const cookieStore = await cookies(); // ✅ fixed
const token = cookieStore.get('accessToken')?.value;

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return Response.json({ error: 'Invalid token' }, { status: 401 });

    const { shopId, name, description, domain, contactEmail, address } = await req.json();

    if (!shopId) {
      return Response.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    const shop = await Shop.findOne({ _id: shopId });

    if (!shop || shop.owner.toString() !== decoded.id) {
      return Response.json({ error: 'Shop not found or unauthorized' }, { status: 403 });
    }

    shop.name = name || shop.name;
    shop.description = description || shop.description;
    shop.domain = domain || shop.domain;
    shop.contactEmail = contactEmail || shop.contactEmail;
    shop.address = address || shop.address;

    await shop.save();

    return Response.json({ shop });
  } catch (err) {
    return Response.json({ error: 'Shop update failed' }, { status: 500 });
  }
}
