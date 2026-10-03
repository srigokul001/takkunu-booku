const Coupon = require('../models/Coupon');

// @desc    Validate and apply a coupon code
// @route   POST /api/coupons/apply
// @access  Public
const applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal, totalAmount } = req.body;
    const effectiveSubtotal = subtotal !== undefined ? subtotal : totalAmount;

    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a coupon code.',
      });
    }

    if (!effectiveSubtotal || Number(effectiveSubtotal) <= 0) {
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

    if (coupon.minBookingAmount && Number(effectiveSubtotal) < coupon.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum booking amount of $${coupon.minBookingAmount}.`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((Number(effectiveSubtotal) * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(Number(effectiveSubtotal), coupon.discountValue);
    }

    const finalAmount = Math.max(0, Number(effectiveSubtotal) - discountAmount);

    res.json({
      success: true,
      message: `Coupon "${cleanCode}" applied successfully! You saved $${discountAmount}.`,
      discountAmount,
      finalAmount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        subtotal: Number(effectiveSubtotal),
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
