// lib/createUser.js
import { User } from '@/models/User';
import { Shop } from '@/models/Shop';
import { ShopUser } from '@/models/ShopUser';
import bcrypt from 'bcryptjs';

export async function createUserWithShop({
  email,
  name,
  password = null,
  provider = 'credentials',
  firstName = '',
  lastName = '',
  dob = '',
  skipIfExists = false,
}) {
  let user = await User.findOne({ email });

  if (user && skipIfExists) {
    // Return user and first mapped shop (optional)
    const mapping = await ShopUser.findOne({ userId: user._id }).populate('shopId');
    return { user, shop: mapping?.shopId ?? null };
  }

  if (user) throw new Error('User already exists');

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  user = await User.create({
    email,
    name,
    password: hashedPassword,
    provider,
    firstName,
    lastName,
    dob,
  });

  const shop = await Shop.create({
    name: name || 'My Shop',
    isRoot: true,
    parentShopId: null,
  });

  await ShopUser.create({
    shopId: shop._id,
    userId: user._id,
    role: 'owner',
  });

  return { user, shop };
}
