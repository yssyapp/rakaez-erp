const express = require('express');
const { getAllOrders, createOrder, updateOrderStatus } = require('../controllers/orders.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route GET /api/orders
/// @desc الحصول على جميع الطلبات
router.get('/', verifyToken, getAllOrders);

/// @route POST /api/orders
/// @desc إنشاء طلب جديد
router.post('/', verifyToken, createOrder);

/// @route PUT /api/orders/:id/status
/// @desc تحديث حالة الطلب
router.put('/:id/status', verifyToken, authorize('shop', 'admin'), updateOrderStatus);

module.exports = router;
