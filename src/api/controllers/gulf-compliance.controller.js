const axios = require('axios');
const crypto = require('crypto');
const ZATCAInvoice = require('../../database/models/ZATCAInvoice');
const GulfCashierConfig = require('../../database/models/GulfCashierConfig');
const GulfComplianceLog = require('../../database/models/GulfComplianceLog');

/// إنشاء فاتورة متوافقة مع ZATCA
const createZATCACompliantInvoice = async (req, res) => {
  try {
    const {
      shopId,
      invoiceType,
      seller,
      buyer,
      lines,
      countryCode = 'SA',
    } = req.body;

    if (!shopId || !seller || !buyer || !lines || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب أن تكون معبأة',
      });
    }

    // الحصول على إعدادات الكاشير الخليجي
    const config = await GulfCashierConfig.findOne({ shopId, countryCode });
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'إعدادات الكاشير غير موجودة للدولة المحددة',
      });
    }

    // حساب الإجماليات
    let subtotal = 0;
    let totalTax = 0;

    const processedLines = lines.map((line) => {
      const lineTotal = line.quantity * line.unitPrice;
      const taxAmount = lineTotal * (line.taxPercent || 0.15);
      subtotal += lineTotal;
      totalTax += taxAmount;

      return {
        ...line,
        taxAmount,
        lineTotal,
      };
    });

    const taxableAmount = subtotal;
    const total = subtotal + totalTax;

    // إنشاء UUID للفاتورة
    const invoiceUUID = crypto.randomUUID();

    // إنشاء الفاتورة
    const invoice = new ZATCAInvoice({
      invoiceUUID,
      invoiceNumber: `${config.invoiceSettings.invoicePrefix}-${config.invoiceSettings.invoiceSequence}`,
      invoiceType,
      issueDate: new Date(),
      issueTime: new Date().toISOString(),
      countryCode,
      seller,
      buyer,
      lines: processedLines,
      subtotal,
      taxableAmount,
      totalTax,
      total,
      currency: config.currencySettings.primaryCurrency || 'SAR',
      zatcaStatus: 'draft',
    });

    await invoice.save();

    // تحديث رقم التسلسل
    await GulfCashierConfig.findByIdAndUpdate(config._id, {
      'invoiceSettings.invoiceSequence': config.invoiceSettings.invoiceSequence + 1,
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الفاتورة بنجاح',
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/// توقيع الفاتورة رقمياً وتقديمها إلى ZATCA
const submitInvoiceToZATCA = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await ZATCAInvoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة',
      });
    }

    if (invoice.zatcaStatus !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'الفاتورة لم تعد في حالة المسودة',
      });
    }

    // توقيع الفاتورة
    const signedInvoice = await signInvoiceWithCertificate(invoice);

    // إنشاء QR Code
    const qrCode = generateQRCode(signedInvoice);

    // تقديم إلى ZATCA (إذا كان في الإنتاج)
    const zatcaResponse = await submitToZATCAPortal(signedInvoice);

    // تحديث الفاتورة
    invoice.signature = signedInvoice.signature;
    invoice.qrCode = qrCode;
    invoice.zatcaStatus = 'submitted';
    invoice.zatcaResponse = zatcaResponse;
    invoice.zatcaSubmissionUUID = zatcaResponse.submissionUUID;

    await invoice.save();

    // تسجيل في السجل الامتثالي
    await GulfComplianceLog.create({
      shopId: invoice.seller,
      countryCode: invoice.countryCode,
      regulatoryBody: 'ZATCA',
      complianceType: 'INVOICE_REPORTING',
      status: 'submitted',
      details: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
      },
      submittedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'تم تقديم الفاتورة إلى ZATCA بنجاح',
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/// توقيع الفاتورة رقمياً
const signInvoiceWithCertificate = async (invoice) => {
  try {
    // هذا يجب أن يكون متصلاً بشهادة ZATCA الفعلية
    const signatureHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(invoice))
      .digest('hex');

    return {
      signature: {
        hash: signatureHash,
        publicKeyIndex: 1,
        timestamp: new Date(),
      },
    };
  } catch (error) {
    throw new Error(`خطأ في التوقيع الرقمي: ${error.message}`);
  }
};

/// إنشاء QR Code للفاتورة
const generateQRCode = (invoice) => {
  // يجب استخدام مكتبة QR Code مثل qrcode
  const qrData = `
    Invoice Number: ${invoice.invoiceNumber}
    Date: ${invoice.issueDate}
    Amount: ${invoice.total}
    Tax: ${invoice.totalTax}
  `;

  return Buffer.from(qrData).toString('base64');
};

/// تقديم الفاتورة إلى بوابة ZATCA
const submitToZATCAPortal = async (invoice) => {
  try {
    // هذا يجب أن يكون متصلاً بـ API الفعلية لـ ZATCA
    // للتطوير، نرجع استجابة وهمية

    return {
      success: true,
      submissionUUID: crypto.randomUUID(),
      status: 'CLEARED',
      clearedInvoice: invoice,
      warnings: [],
    };
  } catch (error) {
    throw new Error(`خطأ في تقديم ZATCA: ${error.message}`);
  }
};

/// الحصول على تقرير الامتثال اليومي
const getDailyComplianceReport = async (req, res) => {
  try {
    const { shopId, countryCode, date } = req.query;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const invoices = await ZATCAInvoice.find({
      'seller.identifier': shopId,
      countryCode,
      issueDate: { $gte: startDate, $lte: endDate },
    });

    const complianceLogs = await GulfComplianceLog.find({
      shopId,
      countryCode,
      submittedAt: { $gte: startDate, $lte: endDate },
    });

    const report = {
      date,
      countryCode,
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalTax: invoices.reduce((sum, inv) => sum + inv.totalTax, 0),
      zatcaCompliant: invoices.filter((inv) => inv.zatcaStatus === 'cleared').length,
      complianceLogs,
      invoicesByStatus: {
        draft: invoices.filter((inv) => inv.zatcaStatus === 'draft').length,
        submitted: invoices.filter((inv) => inv.zatcaStatus === 'submitted').length,
        cleared: invoices.filter((inv) => inv.zatcaStatus === 'cleared').length,
        rejected: invoices.filter((inv) => inv.zatcaStatus === 'rejected').length,
      },
    };

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/// الحصول على تقرير الامتثال الشهري
const getMonthlyComplianceReport = async (req, res) => {
  try {
    const { shopId, countryCode, month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const invoices = await ZATCAInvoice.find({
      'seller.identifier': shopId,
      countryCode,
      issueDate: { $gte: startDate, $lte: endDate },
    });

    const complianceLogs = await GulfComplianceLog.find({
      shopId,
      countryCode,
      submittedAt: { $gte: startDate, $lte: endDate },
    });

    const report = {
      month,
      year,
      countryCode,
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalTax: invoices.reduce((sum, inv) => sum + inv.totalTax, 0),
      zatcaCompliance: {
        compliant: invoices.filter((inv) => inv.zatcaStatus === 'cleared').length,
        nonCompliant: invoices.filter(
          (inv) => inv.zatcaStatus === 'rejected' || inv.zatcaStatus === 'draft'
        ).length,
        percentage:
          ((invoices.filter((inv) => inv.zatcaStatus === 'cleared').length / invoices.length) *
            100) ||
          0,
      },
      complianceLogs,
      penalties: complianceLogs
        .filter((log) => log.penalties?.hasPenalty)
        .map((log) => ({
          type: log.penalties.penaltyType,
          amount: log.penalties.penaltyAmount,
          reason: log.penalties.penaltyReason,
        })),
    };

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createZATCACompliantInvoice,
  submitInvoiceToZATCA,
  getDailyComplianceReport,
  getMonthlyComplianceReport,
};
