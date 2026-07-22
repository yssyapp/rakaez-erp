const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () => 'ORD-' + Date.now(),
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    items: [
      {
        partId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Part',
          required: true,
        },
        partName: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: function () {
        return this.subtotal * 0.15; // 15% tax
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'apple_pay', 'google_pay'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: { type: String, default: 'Saudi Arabia' },
    },
    deliveryDate: Date,
    notes: String,
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

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
