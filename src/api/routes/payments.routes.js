const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route POST /api/payments/process
/// @desc معالجة الدفع
router.post('/process', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - معالجة الدفع'
  });
});

/// @route POST /api/payments/webhook
/// @desc webhook من Stripe
router.post('/webhook', (req, res) => {
  res.json({
    success: true,
    message: 'قريباً - معالجة Webhook'
  });
});

module.exports = router;
