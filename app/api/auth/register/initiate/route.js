import { connectDB } from '@/lib/db';
import { PendingUser } from '@/models/PendingUser';
import bcrypt from 'bcryptjs';
import { generateEmailVerificationToken } from '@/utils/emailVerification';
import { sendVerificationEmail } from '@/utils/mailer';
import { User } from '@/models/User';

export async function POST(request) {
  await connectDB();
  const { email, password, name } = await request.json();
  if (!email || !password || !name) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return Response.json({ error: 'User already registered' }, { status: 400 });
  }

  const existingPending = await PendingUser.findOne({ email });
  if (existingPending) {
    return Response.json({ error: 'Verification pending. Please check your email.' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { rawToken, hashedToken } = generateEmailVerificationToken();

  const pending = await PendingUser.create({
    email,
    name,
    password: hashedPassword,
    emailVerifyToken: hashedToken,
    emailVerifyTokenExpires: Date.now() + 10 * 60 * 1000,
  });

  await sendVerificationEmail(email, rawToken);
  return Response.json({ message: 'OTP sent. Please verify.', userId: pending._id });
}
