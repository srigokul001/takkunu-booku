const Coupon = require('../models/Coupon');

// @desc    Validate and apply a coupon code
// @route   POST /api/coupons/apply
// @access  Public
const applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a coupon code.',
      });
    }

    if (!subtotal || Number(subtotal) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking subtotal amount.',
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon "${cleanCode}" is invalid or expired.`,
      });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" has expired.`,
      });
    }

    if (coupon.minBookingAmount && Number(subtotal) < coupon.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum booking amount of $${coupon.minBookingAmount}.`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((Number(subtotal) * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(Number(subtotal), coupon.discountValue);
    }

    const finalAmount = Math.max(0, Number(subtotal) - discountAmount);

    res.json({
      success: true,
      message: `Coupon "${cleanCode}" applied successfully! You saved $${discountAmount}.`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        subtotal: Number(subtotal),
        finalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
const getAvailableCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true }).select('-__v');
    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyCoupon,
  getAvailableCoupons,
};
