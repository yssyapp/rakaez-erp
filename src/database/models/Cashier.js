const mongoose = require('mongoose');

const cashierSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      default: () => 'TXN-' + Date.now(),
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    items: [
      {
        partId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Part',
        },
        partName: String,
        quantity: Number,
        unitPrice: Number,
        discount: {
          type: Number,
          default: 0,
        },
        totalPrice: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tax: {
      type: Number,
      default: function () {
        return (this.subtotal - this.discountAmount) * 0.15;
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'apple_pay', 'google_pay', 'check'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    notes: String,
    receiptNumber: {
      type: String,
      unique: true,
      default: () => 'RCP-' + Date.now(),
    },
    isVoided: {
      type: Boolean,
      default: false,
    },
    voidReason: String,
    voidedAt: Date,
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
cashierSchema.index({ shopId: 1, createdAt: -1 });
cashierSchema.index({ cashierId: 1, createdAt: -1 });
cashierSchema.index({ transactionId: 1 });
cashierSchema.index({ receiptNumber: 1 });

const Cashier = mongoose.model('Cashier', cashierSchema);

module.exports = Cashier;
