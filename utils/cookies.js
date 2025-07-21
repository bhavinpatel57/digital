'use server';

import { cookies } from 'next/headers';

export async function setRefreshCookie(token) {
  const cookieStore = await cookies(); // ✅ sync call
  cookieStore.set('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function deleteRefreshCookie() {
  const cookieStore = await cookies();
  cookieStore.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'Strict',
    maxAge: 0,
  });
}

export async function setAccessCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });
}
