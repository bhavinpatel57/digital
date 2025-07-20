// lib/getUserShops.js
import { ShopUser } from '@/models/ShopUser';
import { Shop } from '@/models/Shop';

export async function getUserShops(userId) {
  const mappings = await ShopUser.find({ userId }).populate('shopId');
  return mappings.map(m => ({
    shopId: m.shopId._id,
    name: m.shopId.name,
    role: m.role,
    isRoot: m.shopId.isRoot,
  }));
}


