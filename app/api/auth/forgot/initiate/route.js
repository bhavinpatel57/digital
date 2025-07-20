import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { generateResetToken } from '@/utils/resetToken';
import { sendVerificationEmail } from '@/utils/mailer';

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();

  const user = await User.findOne({ email });
  if (!user) return Response.json({ message: 'OTP sent if account exists' });

  const { rawToken, hashedToken } = generateResetToken();
  user.resetToken = hashedToken;
  user.resetTokenExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendVerificationEmail(user.email, rawToken);
  return Response.json({ message: 'OTP sent if account exists', userId: user._id });
}
