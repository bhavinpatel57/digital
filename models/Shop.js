import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentShop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null }, // null for root
  branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }],
}, { timestamps: true });

export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
