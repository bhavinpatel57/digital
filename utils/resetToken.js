import crypto from 'crypto';

export function generateResetToken() {
  const rawToken = Math.floor(100000 + Math.random() * 900000).toString(); // ✅ 6-digit numeric OTP
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}
