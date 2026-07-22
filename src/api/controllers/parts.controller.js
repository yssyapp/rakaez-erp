const Part = require('../../database/models/Part');

/// الحصول على جميع القطع
const getAllParts = async (req, res) => {
  try {
    const { category, shopId, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (shopId) query.shopId = shopId;
    if (search) {
      query.$or = [
        { partName: { $regex: search, $options: 'i' } },
        { carBrand: { $regex: search, $options: 'i' } },
        { carModel: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const parts = await Part.find(query)
      .populate('shopId', 'name city')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Part.countDocuments(query);

    res.status(200).json({
      success: true,
      data: parts,
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

/// الحصول على قطعة واحدة
const getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).populate('shopId', 'name phone email city');

    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'القطعة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: part
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// إضافة قطعة جديدة
const createPart = async (req, res) => {
  try {
    const { partName, partNumber, carBrand, carModel, category, price, quantity, manufacturingCountry, shopId } = req.body;

    if (!partName || !partNumber || !carBrand || !carModel || !category || !price || !shopId) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب أن تكون معبأة'
      });
    }

    const existingPart = await Part.findOne({ partNumber });
    if (existingPart) {
      return res.status(400).json({
        success: false,
        message: 'رقم القطعة موجود بالفعل'
      });
    }

    const part = new Part({
      ...req.body,
      shopId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await part.save();

    res.status(201).json({
      success: true,
      message: 'تم إضافة القطعة بنجاح',
      data: part
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// تحديث قطعة
const updatePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'القطعة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث القطعة بنجاح',
      data: part
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/// حذف قطعة
const deletePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'القطعة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف القطعة بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  deletePart
};
