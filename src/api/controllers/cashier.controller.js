const Cashier = require('../../database/models/Cashier');
const CashierDrawer = require('../../database/models/CashierDrawer');

/// إنشاء معاملة نقدية جديدة
const createCashierTransaction = async (req, res) => {
  try {
    const { shopId, cashierId, customerId, items, paymentMethod, discountPercentage, notes } = req.body;

    if (!shopId || !cashierId || !items || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب أن تكون معبأة'
      });
    }

    // حساب الإجمالي
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.totalPrice || (item.quantity * item.unitPrice);
    });

    const discountAmount = (subtotal * (discountPercentage || 0)) / 100;
    const tax = (subtotal - discountAmount) * 0.15;
    const total = subtotal - discountAmount + tax;

    const transaction = new Cashier({
      shopId,
      cashierId,
      customerId,
      items,
      subtotal,
      discountAmount,
      discountPercentage,
      tax,
      total,
      paymentMethod,
      paymentStatus: 'completed',
      notes
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المعاملة بنجاح',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// الحصول على جميع المعاملات
const getAllCashierTransactions = async (req, res) => {
  try {
    const { shopId, cashierId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { isVoided: false };
    if (shopId) query.shopId = shopId;
    if (cashierId) query.cashierId = cashierId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const transactions = await Cashier.find(query)
      .populate('shopId', 'name city')
      .populate('cashierId', 'name email')
      .populate('customerId', 'name phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Cashier.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// إلغاء معاملة
const voidCashierTransaction = async (req, res) => {
  try {
    const { reason } = req.body;

    const transaction = await Cashier.findByIdAndUpdate(
      req.params.id,
      {
        isVoided: true,
        voidReason: reason,
        voidedAt: new Date(),
        voidedBy: req.user.id
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'المعاملة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم إلغاء المعاملة بنجاح',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// فتح درج النقد
const openCashierDrawer = async (req, res) => {
  try {
    const { shopId, cashierId, openingBalance } = req.body;

    // التحقق من عدم وجود درج مفتوح
    const existingDrawer = await CashierDrawer.findOne({
      shopId,
      cashierId,
      status: 'open'
    });

    if (existingDrawer) {
      return res.status(400).json({
        success: false,
        message: 'درج النقد مفتوح بالفعل. يجب إغلاق الدرج السابق أولاً'
      });
    }

    const drawer = new CashierDrawer({
      shopId,
      cashierId,
      openingBalance,
      openedAt: new Date(),
      openedBy: req.user.id,
      status: 'open'
    });

    await drawer.save();

    res.status(201).json({
      success: true,
      message: 'تم فتح درج النقد بنجاح',
      data: drawer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// إغلاق درج النقد
const closeCashierDrawer = async (req, res) => {
  try {
    const { closingBalance, notes } = req.body;

    const drawer = await CashierDrawer.findByIdAndUpdate(
      req.params.id,
      {
        status: 'closed',
        closingBalance,
        closedAt: new Date(),
        closedBy: req.user.id,
        notes
      },
      { new: true }
    );

    if (!drawer) {
      return res.status(404).json({
        success: false,
        message: 'درج النقد غير موجود'
      });
    }

    // حساب الفرق
    const totalTransactions = await Cashier.aggregate([
      {
        $match: {
          _id: { $in: drawer.transactions },
          paymentMethod: 'cash'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const expectedBalance = drawer.openingBalance + (totalTransactions[0]?.total || 0);
    const variance = closingBalance - expectedBalance;

    await CashierDrawer.findByIdAndUpdate(
      drawer._id,
      {
        expectedBalance,
        variance
      }
    );

    res.status(200).json({
      success: true,
      message: 'تم إغلاق درج النقد بنجاح',
      data: {
        ...drawer.toObject(),
        expectedBalance,
        variance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// الحصول على تقرير يومي
const getDailyCashierReport = async (req, res) => {
  try {
    const { shopId, date } = req.query;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await Cashier.find({
      shopId,
      isVoided: false,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const report = {
      date,
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.total, 0),
      totalCash: transactions
        .filter(t => t.paymentMethod === 'cash')
        .reduce((sum, t) => sum + t.total, 0),
      totalCard: transactions
        .filter(t => ['credit_card', 'debit_card'].includes(t.paymentMethod))
        .reduce((sum, t) => sum + t.total, 0),
      totalDiscount: transactions.reduce((sum, t) => sum + t.discountAmount, 0),
      totalTax: transactions.reduce((sum, t) => sum + t.tax, 0),
      paymentMethods: {}
    };

    // تجميع حسب طريقة الدفع
    transactions.forEach(t => {
      if (!report.paymentMethods[t.paymentMethod]) {
        report.paymentMethods[t.paymentMethod] = { count: 0, total: 0 };
      }
      report.paymentMethods[t.paymentMethod].count++;
      report.paymentMethods[t.paymentMethod].total += t.total;
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCashierTransaction,
  getAllCashierTransactions,
  voidCashierTransaction,
  openCashierDrawer,
  closeCashierDrawer,
  getDailyCashierReport
};
