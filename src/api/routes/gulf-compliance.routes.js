const express = require('express');
const {
  createZATCACompliantInvoice,
  submitInvoiceToZATCA,
  getDailyComplianceReport,
  getMonthlyComplianceReport,
} = require('../controllers/gulf-compliance.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route POST /api/compliance/invoice/create
/// @desc إنشاء فاتورة متوافقة مع ZATCA
router.post('/invoice/create', verifyToken, authorize('shop', 'admin'), createZATCACompliantInvoice);

/// @route POST /api/compliance/invoice/:id/submit
/// @desc تقديم الفاتورة إلى ZATCA
router.post('/invoice/:id/submit', verifyToken, authorize('shop', 'admin'), submitInvoiceToZATCA);

/// @route GET /api/compliance/report/daily
/// @desc الحصول على التقرير اليومي
router.get('/report/daily', verifyToken, getDailyComplianceReport);

/// @route GET /api/compliance/report/monthly
/// @desc الحصول على التقرير الشهري
router.get('/report/monthly', verifyToken, getMonthlyComplianceReport);

module.exports = router;
