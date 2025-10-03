const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');
const AppError = require('../utils/appError');

const createCoupon= async (req,res,next) => {
    try{
        const {code, description, discount, value, minimumPurchase, expiryDate, usageLimit}= req.body;

        const existingCoupon= await Coupon.findOne({code: code.toUpperCase()})
        if(existingCoupon) return next(new AppError('Error',400,'Coupon already exists'));
        if(discount === 'percentage' && value>100) {
             return next(new AppError('Error', 400, 'Percentage cannot exceed 100'));
        }
        const coupon= await Coupon.create({
            code,
            description,
            discount,
            value,
            minimumPurchase,
            expiryDate,
            usageLimit
        })

        res.status(201).json({
            status: 'Success',
            message: 'Coupon created successfully',
            data: coupon
        })
    }catch (err) {
        next(err)
    }
}
const getAllCoupons= async (req,res,next) => {
    try {
        const {active, expired, page= 1, limit = 10} = req.query;
        const filterConditions= {}; 
        
        if(active == 'true') {
            filterConditions.isActive= true;
            filterConditions.expiryDate= { $gte: new Date()};
        }
        if(expired == 'true') {
            filterConditions.expiryDate= { $lte: new Date()}
        }
        const skip = (page-1) *limit;
        const totalDocs= await Coupon.countDocuments(filterConditions);

        const coupons= await Coupon.find(filterConditions)
        .sort('-createdAt')
        .limit(Number(limit))
        .skip(skip)
        
        res.status(200).json({
            status: 'Success',
            totalPages: Math.ceil(totalDocs/limit),
            currentPage: Number(page),
            data: coupons        
        })
    }catch(err) {
        next(err)
    }   
}
const getCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
            .populate('usedBy.user', 'name email');
        
        if (!coupon) {
            return next(new AppError('Error', 404, 'Coupon not found'));
        }
        
        res.status(200).json({
            status: 'Success',
            data: coupon
        });
    } catch (err) {
        next(err);
    }
};

const updateCoupon= async (req,res,next) => {
    try {
        const updates= req.body;

        delete updates.code;

        delete updates.usedCount;

        delete updates.usedBy;

        if(updates.discount=== 'percentage' && updates.value>100) {
            return next(new AppError('Error', 400, 'Percentage cannot exceed 100'));
        }
        const updatedCoupon= await Coupon.findByIdAndUpdate(req.params.id,
            updates,{new: true, runValidators: true});

        if (!updatedCoupon) {
                return next(new AppError('Error', 404, 'Coupon not found'));
        }   
        res.status(200).json({
            status: 'Success',
            message: 'Updated successfully',
            data: updatedCoupon
        }) 
    }catch (err) {
        next(err)
    }
}

const deleteCoupon= async (req,res,next) => {
    try {
        const couponId= req.params.id;

        const coupon= await Coupon.findByIdAndDelete(couponId);
        
        if(!coupon) {
            return next(new AppError('Error', 404, 'Coupon not found'));
        }
        res.status(200).json({
            status: 'Success',
            message: 'Coupon deleted'
        })
    }catch(err) {
        next(err)
    }
}
const toggleCouponStatus= async (req,res,next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if(!coupon) {
            return next(new AppError('Error', 404, 'Coupon not found'));
        }
        
        coupon.isActive= !coupon.isActive;

        await coupon.save();
        res.status(200).json({
            status: "Success",
            message: `Coupon ${coupon.isActive ? 'activated' : `deactivated`} successfully`,
            data: coupon
        });
    }catch (err) {
        next(err)
    }
}

const applyCoupon= async (req,res,next) =>{
    try {
        const {code} = req.body;
        const userId= req.user.id;
        if(!code) {
            return next(new AppError('Error', 400, 'Coupon code is required'));
        }
        const coupon= await Coupon.findOne({code: code.toUpperCase()});
        if(!coupon) {
                return next(new AppError('Error', 404, 'Coupon not found'));
        }
        const validCheck= coupon.isValid();
        if(!validCheck.valid) {
            return next(new AppError('Error',400,validCheck.message));
        }
        if(coupon.isUsedByUser(userId)) {
            return next(new AppError('Error', 400, 'You have already used this coupon'));
        }
        const cart= await Cart.findOne({user: userId}).populate('items.product');

        if(!cart) {
            return next(new AppError('Error',404,'Cart not found'))
        }
        const cartTotal= cart.items.reduce((sum,item) => {
            return sum + (item.product.price * item.quantity);
        },0)
        const discountResult= coupon.calculateDiscount(cartTotal);
        if(!discountResult.valid) {
            return next(new AppError('Error',400,discountResult.message))
        }
        res.status(200).json({
            status: 'Success',
            message: 'Coupon applied successfully',
            data: {
            couponCode: coupon.code,
            couponId: coupon._id,
            description: coupon.description,
            cartTotal,
            discount: discountResult.discount,
            totalPrice: discountResult.finalPrice,
            savings: discountResult.discount
            }
        })
    }catch(err) {
        next(err)
    }
}

const getAvailableCoupons= async (req,res,next) =>{
    try{
        const userId= req.user.id;

        const now = new Date();

        const coupons= await Coupon.find({isActive: true ,expiryDate: { $gt: now}})

        const availableCoupons= coupons.filter((coupon) => {
            if(coupon.isUsedByUser(userId)) return false;

            if(coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
            return true;
        })
        res.status(200).json({
            status: 'Success',
            results: availableCoupons.length,
            data: availableCoupons.map((coupon) => ({
                code: coupon.code,
                description: coupon.description,
                discount: coupon.discount,
                value: coupon.value,
                minimumPurchase: coupon.minimumPurchase,
                expiryDate: coupon.expiryDate
            }))
        })
    }catch(err) {
        next(err)
    }
}
const markCouponAsUsed= async (couponId,userId,orderId) => {
    try {
        const coupon= await Coupon.findById(couponId)
        if (!coupon) return;
        coupon.usedCount+=1;

        coupon.usedBy.push({
            user: userId,
            usedAt: new Date()
        });
        await coupon.save();
        
    }catch(err) {
        console.error('Error marking coupon as used:', err);
    }
}

module.exports= {createCoupon,
    getAllCoupons,
    getCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    applyCoupon,
    getAvailableCoupons,
    markCouponAsUsed }