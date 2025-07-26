// app/api/shop/create/route.js
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';

export async function POST(req) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return Response.json({ error: 'Invalid token' }, { status: 401 });

    const { name, description, domain, contactEmail, address } = await req.json();

    if (!name || !domain) {
      return Response.json({ error: 'Name and domain are required' }, { status: 400 });
    }

    const newShop = await Shop.create({
      name,
      description,
      domain,
      contactEmail,
      address,
      owner: decoded.id,
    });

    return Response.json({ shop: newShop });
  } catch (err) {
    return Response.json({ error: 'Shop creation failed' }, { status: 500 });
  }
}
