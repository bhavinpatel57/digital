import crypto from 'crypto';

export function generateEmailVerificationToken() {
  const rawToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}
