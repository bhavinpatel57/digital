// lib/getCurrentShop.js
import { ShopUser } from '@/models/ShopUser';
import { Shop } from '@/models/Shop';

export async function getCurrentShop(userId) {
  const primary = await ShopUser.findOne({ userId }).sort({ createdAt: 1 }).populate('shopId');
  return primary?.shopId ?? null;
}
