const express = require('express');
const router = express.Router();
const controller = require('../controllers/couponController');
const verifyToken = require('../middlewares/verifyToken');
const authorizedRoles = require('../middlewares/authorizedRoles');

// User routes (must be authenticated)
router.get('/available', verifyToken, controller.getAvailableCoupons);
router.post('/apply', verifyToken, controller.applyCoupon);

// Admin routes (must be admin)
router.post('/', verifyToken, authorizedRoles('admin'), controller.createCoupon);
router.get('/', verifyToken, authorizedRoles('admin'), controller.getAllCoupons);
router.get('/:id', verifyToken, authorizedRoles('admin'), controller.getCoupon);
router.put('/:id', verifyToken, authorizedRoles('admin'), controller.updateCoupon);
router.delete('/:id', verifyToken, authorizedRoles('admin'), controller.deleteCoupon);
router.patch('/toggle/:id', verifyToken, authorizedRoles('admin'), controller.toggleCouponStatus);

module.exports = router;
