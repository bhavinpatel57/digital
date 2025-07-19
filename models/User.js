import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'owner' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }, // Link to root shop
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
