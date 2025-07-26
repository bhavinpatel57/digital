// models/PendingUser.js
import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  role: { type: String, default: 'user' }, // Optional, if you want to set a default role
  
  emailVerifyToken: String,
  emailVerifyTokenExpires: Date,
}, { timestamps: true });

export const PendingUser = mongoose.models.PendingUser || mongoose.model('PendingUser', pendingUserSchema);
