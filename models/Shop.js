import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  domain: String,
  contactEmail: String,
  address: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null }, // <-- Add this
}, { timestamps: true });

export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
