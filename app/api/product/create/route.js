import { connectDB } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { Product } from '@/models/Product';

export async function POST(req) {
  try {
    console.log('👉 Connecting DB...');
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    console.log('👉 Token:', token);

    if (!token) {
      console.log('❌ No token');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    console.log('👉 Decoded token:', decoded);
    if (!decoded) {
      console.log('❌ Invalid token');
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    console.log('👉 Request Body:', body);

    const {
      shopId,
      name,
      sku,
      price,
      taxRate,
      unit,
      stock,
      description,
    } = body;

    if (!shopId || !name || price == null) {
      console.log('❌ Missing required fields');
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await Product.create({
      shop: shopId,
      name,
      sku,
      price,
      taxRate,
      unit,
      stock,
      description,
    });

    console.log('✅ Product created:', product);

    return Response.json({ success: true, product });
  } catch (err) {
    console.error('❌ /api/product/create error:', err);
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
