// app/api/auth/change-password/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { getUserFromToken } from '@/utils/token';

export async function POST(request) {
  await connectDB();

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = getUserFromToken(token);
  if (!userData?.id) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();
  
  if (!currentPassword || !newPassword) {
    return Response.json({ error: 'Both current and new password are required' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const user = await User.findById(userData.id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  // Update password
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return Response.json({ message: 'Password changed successfully' });
}

// app/api/auth/check-email/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { PendingUser } from '@/models/PendingUser';

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();

  // Check in both User and PendingUser collections
  const [existingUser, existingPending] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    PendingUser.findOne({ email: normalizedEmail })
  ]);

  return Response.json({ 
    available: !existingUser && !existingPending,
    isPending: !!existingPending,
    isRegistered: !!existingUser
  });
}

// app/api/auth/delete-account/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getUserFromToken } from '@/utils/token';
import { cookies } from 'next/headers';

export async function POST(request) {
  await connectDB();

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = getUserFromToken(token);
  if (!userData?.id) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { password } = await request.json();
  const user = await User.findById(userData.id);

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // For password-based accounts, verify password
  if (user.password) {
    if (!password) {
      return Response.json({ error: 'Password is required' }, { status: 400 });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ error: 'Incorrect password' }, { status: 400 });
    }
  }

  // Delete user
  await User.deleteOne({ _id: userData.id });

  // Clear cookies
  const cookieStore = await cookies();
  cookieStore.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  cookieStore.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 0,
  });

  return Response.json({ message: 'Account deleted successfully' });
}

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
  const genericResponse = Response.json({ message: 'OTP sent if account exists' });

  if (!user) return genericResponse;

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
  });
}

// app/api/auth/forgot/reset/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  await connectDB();
  const { userId, password } = await request.json();

  if (!userId || !password) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Find user by ID only (OTP was already verified in previous step)
  const user = await User.findById(userId);

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Update password and clear any reset tokens
  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return Response.json({ message: 'Password reset successful' });
}

// app/api/auth/forgot/verify/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import crypto from 'crypto';

export async function POST(request) {
  await connectDB();

  const { userId, otp } = await request.json();
  if (!userId || !otp) {
    return Response.json({ error: 'Missing OTP or user ID' }, { status: 400 });
  }

  const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    _id: userId,
    resetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }

  // Don't clear the token here - just return success
  return Response.json({ 
    message: 'OTP verified successfully',
    userId: user._id
  });
}

// app/api/auth/google/route.js
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { generateAccessToken, generateRefreshToken } from '@/utils/token';
import { setRefreshCookie } from '@/utils/cookies';
import { cookies } from 'next/headers';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    await connectDB();

    const { token: idToken } = await req.json();
    if (!idToken) {
      return Response.json({ error: 'Missing Google token' }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return Response.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        provider: 'google',
        isVerified: true,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const cookieStore = await cookies(); // ✅ Must await here

    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 minutes
    });

    await setRefreshCookie(refreshToken); // This uses `await cookies()` too, which is good

    return Response.json({
      message: 'Google login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    return Response.json({ error: 'Google login failed' }, { status: 500 });
  }
}


// app/api/auth/login/route.js
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

// app/api/auth/logout/route.js
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // Delete access token
  cookieStore.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Delete refresh token
  cookieStore.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 0,
  });

  return Response.json({ message: 'Logged out' });
}


// app/api/auth/me/route.js
import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from '@/utils/token';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { generateAccessToken } from '@/utils/token';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    
    // 1. Check access token first
    const accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) return Response.json({ user });
      }
    }

    // 2. If access token invalid/expired, try refresh token
    const refreshToken = cookieStore.get('refreshToken')?.value;
    if (refreshToken) {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      if (decodedRefresh) {
        const user = await User.findById(decodedRefresh.id);
        if (user) {
          const newAccessToken = generateAccessToken(user);
          
          // Set new access token cookie
          cookies().set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15 // 15 minutes
          });

          return Response.json({ user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          }});
        }
      }
    }

    return Response.json({ user: null }, { status: 401 });
  } catch (err) {
    return Response.json({ error: 'Session check failed' }, { status: 500 });
  }
}

// app/api/refresh/route.js
import { cookies } from 'next/headers';
import { verifyRefreshToken, generateAccessToken } from '@/utils/token';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';
import { setAccessCookie } from '@/utils/cookies';

export async function POST() {
  await connectDB();

  const cookieStore = cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME || 'refreshToken')?.value;

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = generateAccessToken(user);

    // ✅ Set new access token as httpOnly cookie
    await setAccessCookie(accessToken);

    return Response.json({ accessToken });
  } catch (err) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// app/api/auth/register/initiate/route.js
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

  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return Response.json({ error: 'User already registered' }, { status: 400 });
  }

  // Optional: Clean up expired pending entries
  await PendingUser.deleteMany({
    email: normalizedEmail,
    emailVerifyTokenExpires: { $lt: Date.now() },
  });

  const existingPending = await PendingUser.findOne({ email: normalizedEmail });
  if (existingPending) {
    return Response.json({ error: 'Verification pending. Please check your email.' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { rawToken, hashedToken } = generateEmailVerificationToken();

  const pending = await PendingUser.create({
    email: normalizedEmail,
    name,
    password: hashedPassword,
    emailVerifyToken: hashedToken,
    emailVerifyTokenExpires: Date.now() + 10 * 60 * 1000,
    role: 'user', // Default role, can be changed later
  });

  await sendVerificationEmail(normalizedEmail, rawToken);
  return Response.json({ message: 'OTP sent. Please verify.', userId: pending._id });
}


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

// app/api/auth/register/verify/route.js
import { connectDB } from '@/lib/db';
import { PendingUser } from '@/models/PendingUser';
import { User } from '@/models/User';
import crypto from 'crypto';

export async function POST(request) {
  await connectDB();

  const { userId, otp, isPending } = await request.json();
  
  if (!userId || !otp) {
    return Response.json({ error: 'Missing OTP or user ID' }, { status: 400 });
  }

  const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

  // Check both collections based on isPending flag
  if (isPending) {
    const pending = await PendingUser.findOne({
      _id: userId,
      emailVerifyToken: hashedToken,
      emailVerifyTokenExpires: { $gt: Date.now() },
    }).select('email name password');

    if (!pending) {
      return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const newUser = await User.create({
      email: pending.email.toLowerCase(),
      password: pending.password,
      name: pending.name,
      provider: 'credentials',
      isVerified: true,
      role: 'user',
    });

    await PendingUser.deleteOne({ _id: userId });

    return Response.json({
      message: 'User created successfully',
      userId: newUser._id,
    });
  } else {
    // Handle verification for existing User records
    const user = await User.findOne({
      _id: userId,
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return Response.json({
      message: 'Email verified successfully',
      userId: user._id,
    });
  }
}

// app/api/auth/set-password/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { getUserFromToken } from '@/utils/token';

export async function POST(req) {
  await connectDB();

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = getUserFromToken(token);
  if (!userData?.id) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { password } = await req.json();
  if (!password || password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const user = await User.findById(userData.id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.provider !== 'google' || user.password) {
    return Response.json({ error: 'Password already set or not a Google account' }, { status: 400 });
  }

  user.password = await bcrypt.hash(password, 12);
  user.provider = 'both'; // now supports both Google + password
  await user.save();

  return Response.json({ message: 'Password set successfully' });
}


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


// app/api/auth/verify/route.js
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { PendingUser } from '@/models/PendingUser';
import { hashToken } from '@/utils/emailVerification';

export async function POST(request) {
  await connectDB();
  const { userId, otp } = await request.json();

  if (!userId || !otp) {
    return Response.json({ error: 'Missing OTP or user ID' }, { status: 400 });
  }

  const hashedToken = hashToken(otp);

  try {
    // First check pending users
    const pendingUser = await PendingUser.findOne({
      _id: userId,
      emailVerifyToken: hashedToken,
      emailVerifyTokenExpires: { $gt: Date.now() }
    });

    if (pendingUser) {
      // Create new verified user
      const newUser = await User.create({
        email: pendingUser.email,
        password: pendingUser.password,
        name: pendingUser.name,
        provider: 'credentials',
        isVerified: true,
        role: pendingUser.role || 'user'
      });

      // Delete pending user
      await PendingUser.deleteOne({ _id: userId });

      return Response.json({ 
        message: 'Account verified successfully',
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name
        }
      });
    }

    // Check regular users
    const user = await User.findOne({
      _id: userId,
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return Response.json({ 
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    return Response.json({ error: 'Verification failed' }, { status: 500 });
  }
}