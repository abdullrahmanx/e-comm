const { required, version } = require('joi')
const mongoose=require('mongoose')
// el order user  product cart




const orderSchema= mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items : [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            min: 1,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    shippingAddressId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: ['pending','paid','shipped','delivered','cancelled','Failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paymentIntentId: String,
    paymentStatus: String,
    paymentMethod: String
}, { versionKey: false});
const Order= mongoose.model('Order',orderSchema);

module.exports= Order