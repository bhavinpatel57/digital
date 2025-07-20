import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/utils/token';
import { setRefreshCookie } from '@/utils/cookies';

export async function POST(request) {
  await connectDB();
  const { email, password } = await request.json();

  const user = await User.findOne({ email });
  if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const response = Response.json({ accessToken });

  setRefreshCookie(response, refreshToken);
  return response;
}
