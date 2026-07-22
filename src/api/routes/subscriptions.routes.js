const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route GET /api/subscriptions
/// @desc الحصول على الاشتراكات
router.get('/', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - إدارة الاشتراكات'
  });
});

/// @route POST /api/subscriptions/checkout
/// @desc إنشاء عملية دفع للاشتراك
router.post('/checkout', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - بوابة الدفع'
  });
});

/// @route POST /api/subscriptions/upgrade
/// @desc ترقية الاشتراك
router.post('/upgrade', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - ترقية الاشتراك'
  });
});

/// @route POST /api/subscriptions/cancel
/// @desc إلغاء الاشتراك
router.post('/cancel', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - إلغاء الاشتراك'
  });
});

module.exports = router;
