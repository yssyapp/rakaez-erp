# Rakaez ERP - نظام إدارة قطع الغيار

## 🚀 نظام متكامل لإدارة متاجر قطع غيار السيارات في السعودية

### المميزات الرئيسية:

#### 1. **إدارة الاشتراكات** 💳
- 3 باقات اشتراك (أساسية - متقدمة - متميزة)
- السعر بالريال السعودي (37 - 112 - 375 ريال/شهر)
- إدارة الدفع والفواتير
- تكامل مع Stripe

#### 2. **إدارة قطع الغيار** 🔧
- إضافة وتعديل وحذف القطع
- تتبع المخزون
- البحث والتصفية المتقدمة
- تصنيفات وفئات

#### 3. **إدارة الطلبات** 📦
- إنشاء وتتبع الطلبات
- إدارة حالة الطلب
- الفواتير التلقائية
- تكامل مع ZATCA

#### 4. **التقارير والإحصائيات** 📊
- تقارير المبيعات
- تحليل الأداء
- إحصائيات العملاء
- رسوم بيانية مفصلة

#### 5. **إدارة المستخدمين** 👥
- إدارة الموظفين
- صلاحيات وأدوار مختلفة
- نظام تسجيل الدخول الآمن
- ملفات شخصية

#### 6. **الذكاء الاصطناعي** 🤖
- توصيات ذكية (Pro + Enterprise)
- تنبؤ بالطلب
- تحليل السلوك

---

## 🛠️ التثبيت

### المتطلبات:
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

### خطوات التثبيت:

```bash
# 1. استنسخ المستودع
git clone https://github.com/yssyapp/rakaez-erp.git
cd rakaez-erp

# 2. ثبت المكتبات
npm install

# 3. انسخ ملف الإعدادات
cp .env.example .env

# 4. عدّل ملف .env بالمعلومات الخاصة بك
# قم بإضافة:
# - رابط قاعدة البيانات
# - مفاتيح API
# - بيانات البريد الإلكتروني

# 5. شغّل التطبيق
npm run dev
```

---

## 📱 الهيكل العام للمشروع

```
rakaez-erp/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── parts.routes.js
│   │   │   ├── orders.routes.js
│   │   │   ├── subscriptions.routes.js
│   │   │   ├── invoices.routes.js
│   │   │   ├── reports.routes.js
│   │   │   └── payments.routes.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── validators/
│   ├── database/
│   │   ├── models/
│   │   └── config.js
│   ├── utils/
│   ├── config/
│   └── app.js
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── App.jsx
├── tests/
├── .env.example
├── package.json
└── server.js
```

---

## 🔐 الأمان

- تشفير كلمات المرور بـ bcrypt
- JWT للمصادقة
- CORS مفعّل
- معدلات حماية من الهجمات
- التحقق من الصيانة (Helmet)
- تشفير البيانات الحساسة

---

## 🌐 API الأساسي

### المصادقة
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### قطع الغيار
```
GET    /api/parts
GET    /api/parts/:id
POST   /api/parts
PUT    /api/parts/:id
DELETE /api/parts/:id
```

### الطلبات
```
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id
```

### الاشتراكات
```
GET    /api/subscriptions
POST   /api/subscriptions/checkout
POST   /api/subscriptions/upgrade
POST   /api/subscriptions/cancel
```

### الفواتير
```
GET    /api/invoices
GET    /api/invoices/:id
POST   /api/invoices/generate
GET    /api/invoices/:id/pdf
```

### التقارير
```
GET    /api/reports/sales
GET    /api/reports/products
GET    /api/reports/customers
GET    /api/reports/performance
```

---

## 💳 الدفع

نستخدم **Stripe** لمعالجة الدفع:
- بطاقات ائتمان
- محافظ رقمية
- التحويلات البنكية

---

## 📄 الفواتير

تكامل كامل مع **ZATCA** (الفاتورة الإلكترونية السعودية):
- إصدار فواتير تلقائية
- توقيع رقمي
- ملف حفظ آمن
- طباعة وتصدير PDF

---

## 🧪 الاختبارات

```bash
npm test
```

---

## 📞 الدعم

للدعم والأسئلة:
- البريد الإلكتروني: support@rakaez.sa
- الهاتف: +966 50 123 4567
- الموقع: https://rakaez.sa

---

## 📜 الرخصة

MIT License - انظر LICENSE للتفاصيل

---

## 👥 المطورون

- **yssyapp** - المؤسس والمطور الرئيسي

---

**صُنع بـ ❤️ للسعودية** 🇸🇦
