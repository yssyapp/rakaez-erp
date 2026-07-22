const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route GET /api/reports/sales
/// @desc تقرير المبيعات
router.get('/sales', verifyToken, authorize('admin', 'manager'), (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - تقارير المبيعات'
  });
});

/// @route GET /api/reports/products
/// @desc تقرير المنتجات
router.get('/products', verifyToken, authorize('admin', 'manager'), (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - تقارير المنتجات'
  });
});

/// @route GET /api/reports/customers
/// @desc تقرير العملاء
router.get('/customers', verifyToken, authorize('admin', 'manager'), (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - تقارير العملاء'
  });
});

module.exports = router;
