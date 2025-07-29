import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  description: String,
  sku: String,
  price: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
