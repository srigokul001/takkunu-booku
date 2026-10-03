const express = require('express');
const router = express.Router();
const { applyCoupon, getAvailableCoupons } = require('../controllers/couponController');

router.get('/', getAvailableCoupons);
router.post('/apply', applyCoupon);

module.exports = router;
