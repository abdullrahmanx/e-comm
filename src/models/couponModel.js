const mongoose= require('mongoose');

const couponSchema= new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Coupon description is required']
    },
    discount: {
        type: String,
        enum: ['percentage','fixed'],
        required: [true, 'Discount value is required']
    },
    value: {
        type: Number,
        required: [true,'Discount value is required']
    },
    minimumPurchase: {
        type: Number,
        default : 0
    },
    expiryDate: {
        type: Date,
        required: [true,'Expiration date is required']
    },
    usageLimit: {
        type: Number,
        default: null 
    },
    usedCount: {
        type: Number,
        default: 0
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }

}, {timestamps: true, versionKey: false})


couponSchema.methods.isValid= function () {
    let now= new Date() ;
    if(!this.isActive) {
        return {valid: false,message: 'Coupon is inactive'};
    }
    if(now> this.expiryDate) {
        return {valid: false, message: 'Coupon is expired'};
    }
    if(this.usageLimit && this.usedCount >= this.usageLimit) {
        return {valid: false, message: 'Coupon usage limit reached'}
    }
    return {valid: true, message: 'Coupon is valid'}
}

couponSchema.methods.isUsedByUser= function(userId) {
    return this.usedBy.some(usage => usage.user.toString()===userId.toString());
}

couponSchema.methods.calculateDiscount= function(cartTotal) {
    if(cartTotal<this.minimumPurchase) {
        return {valid: false, message: `Minimum purchase of $${this.minimumPurchase} is required`}
    }
    let discount = 0;
    if(this.discount== 'percentage') {
        discount= (cartTotal*this.value)/100;
    }else {
        discount= Math.min(this.value,cartTotal);
    }
    return {valid: true,
        discount: Math.round(discount * 100) / 100,
        finalPrice: Math.round((cartTotal-discount)*100) / 100 }
}

const Coupon= mongoose.model('Coupon',couponSchema)

module.exports= Coupon;