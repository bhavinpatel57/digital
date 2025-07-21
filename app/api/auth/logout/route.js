import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // Delete access token
  cookieStore.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Delete refresh token
  cookieStore.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 0,
  });

  return Response.json({ message: 'Logged out' });
}
