// /app/api/shop/branch/delete/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { Branch } from '@/models/Branch';
import { Shop } from '@/models/Shop';

export async function DELETE(req) {
  
  try {
    await connectDB();

    const cookieStore = await cookies(); // ✅ Must await this
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { branchId, shopId } = body;

    if (!branchId || !shopId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const shop = await Shop.findOne({ _id: shopId, owner: decoded.id });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found or access denied' }, { status: 404 });
    }

    const deleteResult = await Branch.deleteOne({ _id: branchId, shop: shop._id });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 });
  }
}
