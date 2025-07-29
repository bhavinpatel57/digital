import crypto from 'crypto';

export function generateEmailVerificationToken() {
  const rawToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}
export function hashToken(token) {
  // Ensure token is treated as string, even if input is number
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}