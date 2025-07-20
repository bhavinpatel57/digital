import { UserShopMap } from '@/models/UserShopMap';

export async function createUserShopMapping(userId, shopId) {
  await UserShopMap.create({ userId, shopId });
}

export async function getUserRootShop(userId) {
  const mapping = await UserShopMap.findOne({ userId });
  return mapping?.shopId;
}
