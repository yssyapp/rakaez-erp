const mongoose = require('mongoose');

const gulfComplianceLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      unique: true,
      default: () => 'LOG-' + Date.now(),
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    countryCode: {
      type: String,
      enum: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
      required: true,
    },
    regulatoryBody: {
      type: String,
      enum: ['ZATCA', 'FTA', 'MOF', 'TAX_AUTHORITY'],
    },
    complianceType: {
      type: String,
      enum: ['VAT_SUBMISSION', 'INVOICE_REPORTING', 'TAX_RETURN', 'AUDIT', 'INSPECTION'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected', 'warning'],
      default: 'pending',
    },
    details: mongoose.Schema.Types.Mixed,
    responseCode: String,
    responseMessage: String,
    submittedAt: Date,
    approvedAt: Date,
    penalties: {
      hasPenalty: Boolean,
      penaltyType: String,
      penaltyAmount: Number,
      penaltyReason: String,
    },
    auditTrail: [
      {
        action: String,
        actor: String,
        timestamp: Date,
        changes: mongoose.Schema.Types.Mixed,
      },
    ],
    documents: [String],
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

gulfComplianceLogSchema.index({ shopId: 1, complianceType: 1 });
gulfComplianceLogSchema.index({ countryCode: 1, status: 1 });
gulfComplianceLogSchema.index({ submittedAt: -1 });

const GulfComplianceLog = mongoose.model('GulfComplianceLog', gulfComplianceLogSchema);

module.exports = GulfComplianceLog;
