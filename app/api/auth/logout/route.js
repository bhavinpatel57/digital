import { deleteRefreshCookie } from '@/utils/cookies';

export async function POST() {
  const response = Response.json({ message: 'Logged out' });
  deleteRefreshCookie(response);
  return response;
}
