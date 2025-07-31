// app/api/auth/forgot/resend/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { generateResetToken } from '@/utils/resetToken';
import { sendVerificationEmail } from '@/utils/mailer';

export async function POST(request) {
  await connectDB();
  const { userId } = await request.json();

  if (!userId) {
    return Response.json({ error: 'User ID is required' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Generate new reset token
  const { rawToken, hashedToken } = generateResetToken();
  user.resetToken = hashedToken;
  user.resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  await sendVerificationEmail(user.email, rawToken);

  return Response.json({ 
    message: 'New OTP sent successfully',
    userId: user._id
  });
}