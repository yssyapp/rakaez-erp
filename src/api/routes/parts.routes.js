const express = require('express');
const {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  deletePart
} = require('../controllers/parts.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route GET /api/parts
/// @desc الحصول على جميع القطع
router.get('/', getAllParts);

/// @route GET /api/parts/:id
/// @desc الحصول على قطعة واحدة
router.get('/:id', getPartById);

/// @route POST /api/parts
/// @desc إضافة قطعة جديدة
router.post('/', verifyToken, authorize('shop', 'admin'), createPart);

/// @route PUT /api/parts/:id
/// @desc تحديث قطعة
router.put('/:id', verifyToken, authorize('shop', 'admin'), updatePart);

/// @route DELETE /api/parts/:id
/// @desc حذف قطعة
router.delete('/:id', verifyToken, authorize('shop', 'admin'), deletePart);

module.exports = router;
