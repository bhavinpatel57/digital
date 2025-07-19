// /api/auth/google/route.js
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from '../../../../lib/db';
import { User } from '../../../../models/User';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    await connectDB();
    const { token } = await req.json();
    console.log('Google token received:', token);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        provider: 'google',
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return Response.json({ token: jwtToken, user: { email: user.email, name: user.name } });
  } catch (err) {
    console.error('Google login error:', err);
    return Response.json({ error: 'Google login failed' }, { status: 500 });
  }
}
