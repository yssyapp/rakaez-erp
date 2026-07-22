const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route GET /api/invoices
/// @desc الحصول على الفواتير
router.get('/', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - إدارة الفواتير'
  });
});

/// @route POST /api/invoices/generate
/// @desc إنشاء فاتورة جديدة
router.post('/generate', verifyToken, authorize('shop', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - إنشاء الفواتير'
  });
});

/// @route GET /api/invoices/:id/pdf
/// @desc تحميل الفاتورة بصيغة PDF
router.get('/:id/pdf', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - تحميل PDF'
  });
});

module.exports = router;
