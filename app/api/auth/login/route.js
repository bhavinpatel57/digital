import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { PendingUser } from '@/models/PendingUser';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/utils/token';
import { setRefreshCookie } from '@/utils/cookies';
import { cookies } from 'next/headers';
import { generateEmailVerificationToken } from '@/utils/emailVerification';
import { sendVerificationEmail } from '@/utils/mailer';

export async function POST(request) {
  await connectDB();
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // Check both User and PendingUser collections
  const [user, pendingUser] = await Promise.all([
    User.findOne({ email }),
    PendingUser.findOne({ email })
  ]);

  // If exists in PendingUser but not in User
  if (pendingUser && !user) {
    // Verify password against pending user
    const isMatch = await bcrypt.compare(password, pendingUser.password);
    if (!isMatch) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if verification token exists or needs regeneration
    if (!pendingUser.emailVerifyToken || pendingUser.emailVerifyTokenExpires < Date.now()) {
      const { rawToken, hashedToken } = generateEmailVerificationToken();
      pendingUser.emailVerifyToken = hashedToken;
      pendingUser.emailVerifyTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await pendingUser.save();
      await sendVerificationEmail(pendingUser.email, rawToken);
    }

    return Response.json({
      error: 'Please verify your email address to continue',
      action: 'complete-verification',
      userId: pendingUser._id.toString(),
      email: pendingUser.email,
      isPending: true // Flag to indicate this is a pending user
    }, { status: 403 });
  }

  // Existing user flow (from your original code)
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (user.provider === 'google' && !user.password) {
    return Response.json({
      error: 'This account uses Google login. Please log in with Google or set a password.',
      action: 'set-password',
      userId: user._id.toString(),
    }, { status: 400 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (user.provider === 'credentials' && !user.isVerified) {
    // Handle unverified existing users (if any)
    if (!user.verificationToken || user.verificationTokenExpires < Date.now()) {
      const { rawToken, hashedToken } = generateEmailVerificationToken();
      user.verificationToken = hashedToken;
      user.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
      await sendVerificationEmail(user.email, rawToken);
    }

    return Response.json({
      error: 'Please verify your email address to continue',
      action: 'complete-verification',
      userId: user._id.toString(),
      email: user.email
    }, { status: 403 });
  }

  // Successful login
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Get the cookies instance and await it
  const cookieStore = await cookies();
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  await setRefreshCookie(refreshToken);

  return Response.json({
    message: 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role
    },
  });
}