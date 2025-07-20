import mongoose from 'mongoose';

// models/Shop.js
const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isRoot: { type: Boolean, default: false },
  parentShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
});


export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
