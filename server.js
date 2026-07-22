const app = require('./src/app');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

const PORT = process.env.PORT || 5000;

// بدء السيرفر
const server = app.listen(PORT, () => {
  console.log(`\n✅ Rakaez ERP Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 API URL: http://localhost:${PORT}/api`);
  console.log(`\n🌐 Dashboard: http://localhost:${PORT}\n`);
});

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
  server.close(() => console.log('✅ Process terminated'));
});
