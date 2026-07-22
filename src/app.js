const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 🔐 Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 📊 Logging
app.use(morgan('combined'));

// ⚡ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'عدد الطلبات كثير جداً، يرجى المحاولة لاحقاً'
});
app.use('/api/', limiter);

// 📝 Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// 🔗 API Routes
app.use('/api/auth', require('./api/routes/auth.routes'));
app.use('/api/parts', require('./api/routes/parts.routes'));
app.use('/api/orders', require('./api/routes/orders.routes'));
app.use('/api/subscriptions', require('./api/routes/subscriptions.routes'));
app.use('/api/invoices', require('./api/routes/invoices.routes'));
app.use('/api/payments', require('./api/routes/payments.routes'));
app.use('/api/reports', require('./api/routes/reports.routes'));
app.use('/api/cashier', require('./api/routes/cashier.routes'));
app.use('/api/compliance', require('./api/routes/gulf-compliance.routes')); // ✨ نظام الامتثال الخليجي

// 🏢 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود',
    path: req.path
  });
});

// ❌ Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطأ في السيرفر',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
