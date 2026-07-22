const Order = require('../../database/models/Order');
const Subscription = require('../../database/models/Subscription');

/// الحصول على جميع الطلبات
const getAllOrders = async (req, res) => {
  try {
    const { status, shopId, customerId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (shopId) query.shopId = shopId;
    if (customerId) query.customerId = customerId;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('shopId', 'name city')
      .populate('items.partId', 'partName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
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

/// إنشاء طلب جديد
const createOrder = async (req, res) => {
  try {
    const { customerId, shopId, items, deliveryAddress, paymentMethod } = req.body;

    // حساب المجموع
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.totalPrice;
    });

    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax;

    const order = new Order({
      customerId,
      shopId,
      items,
      subtotal,
      tax,
      total,
      deliveryAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// تحديث حالة الطلب
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة الطلب',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  updateOrderStatus
};
