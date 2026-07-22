const express = require('express');
const { login, register, getCurrentUser, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

/// @route POST /api/auth/register
/// @desc تسجيل حساب جديد
router.post('/register', register);

/// @route POST /api/auth/login
/// @desc تسجيل الدخول
router.post('/login', login);

/// @route GET /api/auth/me
/// @desc الحصول على بيانات المستخدم الحالي
router.get('/me', verifyToken, getCurrentUser);

/// @route POST /api/auth/logout
/// @desc تسجيل الخروج
router.post('/logout', verifyToken, logout);

module.exports = router;
