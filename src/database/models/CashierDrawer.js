const mongoose = require('mongoose');

const cashierDrawerSchema = new mongoose.Schema(
  {
    drawerId: {
      type: String,
      unique: true,
      default: () => 'DWR-' + Date.now(),
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
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'closed',
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    openedAt: Date,
    closedAt: Date,
    closingBalance: {
      type: Number,
      default: 0,
    },
    expectedBalance: {
      type: Number,
      default: 0,
    },
    variance: {
      type: Number,
      default: 0,
    },
    totalCashTransactions: {
      type: Number,
      default: 0,
    },
    totalCardTransactions: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cashier',
      },
    ],
    notes: String,
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    closedBy: {
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

cashierDrawerSchema.index({ shopId: 1, status: 1 });
cashierDrawerSchema.index({ cashierId: 1, closedAt: -1 });

const CashierDrawer = mongoose.model('CashierDrawer', cashierDrawerSchema);

module.exports = CashierDrawer;
