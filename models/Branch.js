// models/Branch.js
import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  address: String,
  phone: String,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
}, { timestamps: true });

export const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);
