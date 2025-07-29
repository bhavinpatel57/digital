// app/api/auth/verify/resend/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { generateEmailVerificationToken } from '@/utils/emailVerification';
import { sendVerificationEmail } from '@/utils/mailer';

export async function POST(request) {
  await connectDB();
  const { userId } = await request.json();

  const user = await User.findById(userId);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const { rawToken, hashedToken } = generateEmailVerificationToken();
  
  user.verificationToken = hashedToken;
  user.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  await sendVerificationEmail(user.email, rawToken);
  
  return Response.json({ 
    message: 'New verification email sent',
    userId: user._id
  });
}