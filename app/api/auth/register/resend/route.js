// app/api/auth/register/resend/route.js
import { connectDB } from '@/lib/db';
import { PendingUser } from '@/models/PendingUser';
import { generateEmailVerificationToken } from '@/utils/emailVerification';
import { sendVerificationEmail } from '@/utils/mailer';

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();

  // Clean up expired entries first
  await PendingUser.deleteMany({
    email: normalizedEmail,
    emailVerifyTokenExpires: { $lt: Date.now() },
  });

  const pendingUser = await PendingUser.findOne({ email: normalizedEmail });

  if (!pendingUser) {
    return Response.json({ error: 'No pending registration found' }, { status: 404 });
  }

  // Generate new token
  const { rawToken, hashedToken } = generateEmailVerificationToken();
  
  // Update pending user with new token
  pendingUser.emailVerifyToken = hashedToken;
  pendingUser.emailVerifyTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await pendingUser.save();

  await sendVerificationEmail(normalizedEmail, rawToken);
  
  return Response.json({ 
    message: 'New OTP sent', 
    userId: pendingUser._id 
  });
}