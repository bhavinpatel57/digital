import { verifyRefreshToken, generateAccessToken } from '@/utils/token';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';

export async function POST(request) {
  await connectDB();
  const token = request.cookies.get(process.env.COOKIE_NAME)?.value;
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const accessToken = generateAccessToken(user);
  return Response.json({ accessToken });
}
