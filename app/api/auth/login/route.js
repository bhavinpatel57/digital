import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/utils/token';
import { setRefreshCookie } from '@/utils/cookies';
import { cookies } from 'next/headers';

export async function POST(request) {
  await connectDB();
  const { email, password } = await request.json();

  const user = await User.findOne({ email });

  // ⛔️ Invalid email
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // ⛔️ Google login, no password set
  if (user.provider === 'google' && !user.password) {
    return Response.json({
      error: 'This account uses Google login. Please log in with Google or set a password.',
      action: 'set-password',
      userId: user._id.toString(),
    }, { status: 400 });
  }

  // ⛔️ Password mismatch
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // ✅ Auth success
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // ⬇️ Set httpOnly cookie for access token
  cookies().set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15, // 15 minutes
  });

  // ⬇️ Set refresh cookie (via helper)
  const response = Response.json({
    message: 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });

// 🍪 Set refresh token cookie
await setRefreshCookie(refreshToken);

return response;

}
