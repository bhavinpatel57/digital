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