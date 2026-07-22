const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      required: true,
    },
    monthlyPrice: {
      type: Number,
      required: true,
      enum: [37, 112, 375], // الأسعار بالريال السعودي
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    renewalDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'suspended'],
      default: 'active',
    },
    isAutoRenew: {
      type: Boolean,
      default: true,
    },
    maxParts: {
      type: Number,
      required: true,
    },
    hasAI: {
      type: Boolean,
      default: false,
    },
    hasReports: {
      type: Boolean,
      default: true,
    },
    hasMultiStore: {
      type: Boolean,
      default: false,
    },
    features: [String],
    paymentMethod: String,
    paymentHistory: [
      {
        date: Date,
        amount: Number,
        transactionId: String,
        status: String,
      },
    ],
    cancellationReason: String,
    cancelledAt: Date,
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

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
