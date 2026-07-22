const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الرجاء إدخال الاسم'],
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, 'الرجاء إدخال البريد الإلكتروني'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'الرجاء إدخال بريد إلكتروني صحيح'],
    },
    phone: {
      type: String,
      required: true,
      match: [/^\+?[0-9]{10,15}$/, 'رقم الهاتف غير صحيح'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // لا يتم إرجاع كلمة المرور افتراضياً
    },
    userType: {
      type: String,
      enum: ['customer', 'shop', 'admin'],
      default: 'customer',
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'manager', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

// طريقة للتحقق من كلمة المرور
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
