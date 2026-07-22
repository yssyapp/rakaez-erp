const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 🔒 Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 📊 Logging
app.use(morgan('combined'));

// ⚡ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
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

// 🔗 API Routes (Will be added)
app.use('/api/auth', require('./api/routes/auth.routes'));
app.use('/api/parts', require('./api/routes/parts.routes'));
app.use('/api/orders', require('./api/routes/orders.routes'));
app.use('/api/subscriptions', require('./api/routes/subscriptions.routes'));
app.use('/api/invoices', require('./api/routes/invoices.routes'));
app.use('/api/payments', require('./api/routes/payments.routes'));
app.use('/api/reports', require('./api/routes/reports.routes'));

// 🎯  404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// ❌ Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
