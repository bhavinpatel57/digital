import { connectDB } from '../../../../lib/db';
import { User } from '../../../../models/User';
import { Shop } from '../../../../models/Shop';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password, name } = await request.json();
    console.log("📥 Register payload:", { email, name });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("⚠️ User already exists:", email);
      return Response.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, name });

    // ✅ Create root shop for user
    const rootShop = await Shop.create({
      userId: newUser._id,
      name: name || "My Shop",
      isRoot: true,
      parentShopId: null,
    });

    console.log("✅ Registered user & root shop:", newUser.email);
    return Response.json({
      message: 'User registered',
      user: { email: newUser.email, name: newUser.name },
      shop: { id: rootShop._id, name: rootShop.name }
    });

  } catch (err) {
    console.error("❌ Error in register route:", err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
