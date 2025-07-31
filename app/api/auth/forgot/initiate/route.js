// app/api/auth/forgot/initiate/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { generateResetToken } from '@/utils/resetToken';
import { sendVerificationEmail } from '@/utils/mailer';

export async function POST(request) {
  await connectDB();

  const { email } = await request.json();
  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await User.findOne({ email });

  // Always return generic success response
  const genericResponse = Response.json({ 
    message: 'If an account exists, an OTP has been sent',
    email
  });

  if (!user) return genericResponse;

  // Clear any existing reset tokens
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  const { rawToken, hashedToken } = generateResetToken();
  user.resetToken = hashedToken;
  user.resetTokenExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendVerificationEmail(user.email, rawToken);

  if (user.provider === 'google' && !user.password) {
    return Response.json({
      message: 'Google account detected. Please verify OTP to set a password.',
      action: 'verify-otp-set-password',
      userId: user._id.toString(),
    });
  }

  return Response.json({
    message: 'OTP sent if account exists',
    userId: user._id.toString(),
    email: user.email
  });
}