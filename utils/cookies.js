import { serialize } from 'cookie';

export function setRefreshCookie(token) {
  return serialize('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60,
  });
}


export function deleteRefreshCookie() {
  return serialize('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'Strict',
    maxAge: 0,
  });
}
