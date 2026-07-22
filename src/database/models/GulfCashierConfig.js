const mongoose = require('mongoose');

const gulfCashierConfigSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      unique: true,
    },
    countryCode: {
      type: String,
      enum: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
      required: true,
    },
    taxRegulation: {
      type: String,
      enum: ['ZATCA', 'FTA', 'MOF', 'GCC_GST'],
      required: true,
    },
    businessRegistration: {
      registrationNumber: String,
      commercialRegistration: String,
      taxNumber: String,
      businessName: String,
      businessNameAr: String,
      ownerName: String,
      ownerPhone: String,
      ownerEmail: String,
    },
    bankDetails: {
      bankName: String,
      accountHolder: String,
      accountNumber: String,
      IBAN: String,
      swiftCode: String,
      bankCode: String,
    },
    invoiceSettings: {
      invoicePrefix: String,
      invoiceSequence: {
        type: Number,
        default: 1000,
      },
      invoiceType: {
        type: String,
        enum: ['standard', 'simplified'],
        default: 'standard',
      },
      defaultTaxPercent: {
        type: Number,
        default: 15,
      },
      requirePO: Boolean,
      requireCustomerTax: Boolean,
    },
    certifications: {
      zatcaCertificate: {
        certificateData: String,
        privateKey: String,
        environment: {
          type: String,
          enum: ['sandbox', 'production'],
          default: 'sandbox',
        },
        expiryDate: Date,
        status: String,
      },
      ftaCertificate: {
        certificateData: String,
        privateKey: String,
        expiryDate: Date,
      },
    },
    currencySettings: {
      primaryCurrency: String,
      allowedCurrencies: [String],
      exchangeRates: mongoose.Schema.Types.Mixed,
    },
    reportingSettings: {
      reportingFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily',
      },
      reportingTime: String,
      autoSubmit: Boolean,
      reportingEmail: [String],
    },
    complianceSettings: {
      requiresApproval: Boolean,
      requiresAuthorization: Boolean,
      auditTrail: Boolean,
      retentionPeriod: Number,
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

gulfCashierConfigSchema.index({ shopId: 1 });
gulfCashierConfigSchema.index({ countryCode: 1 });

const GulfCashierConfig = mongoose.model('GulfCashierConfig', gulfCashierConfigSchema);

module.exports = GulfCashierConfig;
