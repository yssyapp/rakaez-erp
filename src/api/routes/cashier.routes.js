const express = require('express');
const {
  createCashierTransaction,
  getAllCashierTransactions,
  voidCashierTransaction,
  openCashierDrawer,
  closeCashierDrawer,
  getDailyCashierReport
} = require('../controllers/cashier.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route POST /api/cashier/transaction
/// @desc إنشاء معاملة نقدية جديدة
router.post('/transaction', verifyToken, authorize('shop', 'admin'), createCashierTransaction);

/// @route GET /api/cashier/transactions
/// @desc الحصول على جميع المعاملات
router.get('/transactions', verifyToken, getAllCashierTransactions);

/// @route PUT /api/cashier/transaction/:id/void
/// @desc إلغاء معاملة
router.put('/transaction/:id/void', verifyToken, authorize('shop', 'admin'), voidCashierTransaction);

/// @route POST /api/cashier/drawer/open
/// @desc فتح درج النقد
router.post('/drawer/open', verifyToken, authorize('shop', 'admin'), openCashierDrawer);

/// @route PUT /api/cashier/drawer/:id/close
/// @desc إغلاق درج النقد
router.put('/drawer/:id/close', verifyToken, authorize('shop', 'admin'), closeCashierDrawer);

/// @route GET /api/cashier/report/daily
/// @desc الحصول على تقرير يومي
router.get('/report/daily', verifyToken, authorize('shop', 'admin'), getDailyCashierReport);

module.exports = router;
