import { cookies } from 'next/headers';
import { verifyRefreshToken, generateAccessToken } from '@/utils/token';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';
import { setAccessCookie } from '@/utils/cookies';

export async function POST() {
  await connectDB();

  const cookieStore = cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME || 'refreshToken')?.value;

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = generateAccessToken(user);

    // ✅ Set new access token as httpOnly cookie
    await setAccessCookie(accessToken);

    return Response.json({ accessToken });
  } catch (err) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}
