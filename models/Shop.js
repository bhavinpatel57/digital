// models/Shop.js
import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // One user owns one shop
  contactEmail: String,
  address: String,
}, { timestamps: true });

export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
