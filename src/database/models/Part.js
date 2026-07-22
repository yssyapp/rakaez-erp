const mongoose = require('mongoose');

const partSchema = new mongoose.Schema(
  {
    partName: {
      type: String,
      required: [true, 'اسم القطعة مطلوب'],
      trim: true,
    },
    partNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    carBrand: {
      type: String,
      required: true,
      trim: true,
    },
    carModel: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['محركات', 'مكابح', 'تعليق', 'كهربائية', 'أخرى'],
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStockLevel: {
      type: Number,
      default: 5,
    },
    condition: {
      type: String,
      enum: ['جديد', 'مستعمل', 'معاد'],
      default: 'جديد',
    },
    manufacturingCountry: {
      type: String,
      required: true,
    },
    manufacturingDate: {
      type: Date,
      default: null,
    },
    images: [{
      type: String,
      default: null,
    }],
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    }],
    isActive: {
      type: Boolean,
      default: true,
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

// إنشاء فهرس للبحث السريع
partSchema.index({ partName: 'text', carBrand: 'text', carModel: 'text' });
partSchema.index({ shopId: 1, isActive: 1 });

const Part = mongoose.model('Part', partSchema);

module.exports = Part;
