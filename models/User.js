import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for social login
    name: String,
    firstName: String,
    lastName: String,
    dob: String,

    provider: { type: String, default: 'credentials' }, // or 'google'
    role: { type: String, default: 'user' }, // user, admin, etc.

    isVerified: { type: Boolean, default: false },

    emailVerifyToken: { type: String },
    emailVerifyTokenExpires: { type: Date },

    resetToken: { type: String },
    resetTokenExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
