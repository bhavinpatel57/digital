import { OAuth2Client } from 'google-auth-library';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Shop } from '@/models/Shop';
import { generateToken } from '@/utils/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    await connectDB();

    const { token: idToken } = await req.json();

    if (!idToken) {
      return Response.json({ error: 'Missing Google token' }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return Response.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        provider: 'google',
      });
    }

    const token = generateToken({ id: user._id });

    let shop = await Shop.findOne({ userId: user._id, isRoot: true });
    if (!shop) {
      shop = await Shop.create({
        userId: user._id,
        name: name || 'My Shop',
        isRoot: true,
        parentShopId: null,
      });
    }

    return Response.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      shop: {
        id: shop._id,
        name: shop.name,
      },
    });
  } catch (err) {
    console.error('❌ Google Login Error:', err);
    return Response.json({ error: 'Google login failed' }, { status: 500 });
  }
}
