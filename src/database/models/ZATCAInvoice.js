const mongoose = require('mongoose');

const zatcaInvoiceSchema = new mongoose.Schema(
  {
    invoiceUUID: {
      type: String,
      unique: true,
      required: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => 'INV-' + Date.now(),
    },
    invoiceType: {
      type: String,
      enum: ['standard', 'simplified', 'debit_note', 'credit_note'],
      default: 'standard',
    },
    issueDate: {
      type: Date,
      required: true,
    },
    dueDate: Date,
    issueTime: String,
    countryCode: {
      type: String,
      enum: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
      default: 'SA',
    },
    seller: {
      name: String,
      identifier: String,
      identifierType: {
        type: String,
        enum: ['CR', 'VAT', 'MOUTHIR'],
        default: 'VAT',
      },
      address: String,
      city: String,
      postalCode: String,
      countryCode: String,
      VAT: String,
    },
    buyer: {
      name: String,
      identifier: String,
      identifierType: String,
      address: String,
      city: String,
      postalCode: String,
      countryCode: String,
      VAT: String,
    },
    lines: [
      {
        lineNumber: Number,
        description: String,
        quantity: Number,
        unitCode: String,
        unitPrice: Number,
        taxableAmount: Number,
        taxType: {
          type: String,
          enum: ['VAT', 'EXCISE', 'SERVICE_TAX'],
          default: 'VAT',
        },
        taxPercent: {
          type: Number,
          default: 15,
        },
        taxAmount: Number,
        lineTotal: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxableAmount: Number,
    totalTax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'],
      default: 'SAR',
    },
    signature: {
      hash: String,
      publicKeyIndex: Number,
      timestamp: Date,
    },
    qrCode: String,
    x509Certificate: String,
    zatcaStatus: {
      type: String,
      enum: ['draft', 'submitted', 'reported', 'cleared', 'rejected'],
      default: 'draft',
    },
    zatcaResponse: mongoose.Schema.Types.Mixed,
    zatcaSubmissionUUID: String,
    zatcaReportingStatus: String,
    internalNotes: String,
    attachments: [String],
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

zatcaInvoiceSchema.index({ invoiceNumber: 1 });
zatcaInvoiceSchema.index({ invoiceUUID: 1 });
zatcaInvoiceSchema.index({ zatcaStatus: 1 });
zatcaInvoiceSchema.index({ issueDate: -1 });
zatcaInvoiceSchema.index({ countryCode: 1 });

const ZATCAInvoice = mongoose.model('ZATCAInvoice', zatcaInvoiceSchema);

module.exports = ZATCAInvoice;
