import mongoose from 'mongoose';

// models/Shop.js
const shopUserSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, default: 'owner' }, // 'owner', 'manager', 'staff', etc.
    joinedAt: { type: Date, default: Date.now },
  });


export const ShopUser = mongoose.models.ShopUser || mongoose.model('ShopUser', shopUserSchema);
