const Cart= require('../models/cartModel')
const Order= require('../models/orderModel')
const AppError=require('../utils/appError')
const sendTestEmail = require('../utils/email')
const stripe= require('stripe')(process.env.SECRET_KEY)
const Product= require('../models/productModel')
const Coupon=require('../models/couponModel')
const { default: mongoose } = require('mongoose')
const placeOrder = async (req, res, next) => {
    const session= await mongoose.startSession();
    session.startTransaction();
    try {

        const userId = req.user.id;
        const { shippingAddressId, couponCode } = req.body;

       
        const cart = await Cart.findOne({ user: userId }).populate('items.product').session(session);
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return next(new AppError('Error', 400, "Cart is empty"));
        }

        const stockErrors = [];
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id).session(session);
            if (!product) {
                stockErrors.push(`Product ${item.product.name || item.product._id} not found`);
                continue;
            }
            
            const stockCheck = product.checkStock(item.quantity);
            if (!stockCheck.available) {
                stockErrors.push(`${product.name}: ${stockCheck.message}`);
            }
        }

        if (stockErrors.length > 0) {
            await session.abortTransaction();
            return next(new AppError('Stock Error', 400, stockErrors.join('; ')));
        }

        let totalPrice = cart.items.reduce((sum, item) => {
            return sum + item.product.finalPrice * item.quantity;
        }, 0);
        
        let appliedCoupon = null;
        if (couponCode) {
            const coupon = await Coupon.findOne({ 
                code: couponCode.toUpperCase(),
                isActive: true 
            }).session(session);
            
            if (coupon) {
                const validationResult = coupon.isValid();
                const alreadyUsed = coupon.isUsedByUser(userId);
                
                if (!validationResult.valid) {
                    await session.abortTransaction();
                    return next(new AppError('Coupon Error', 400, validationResult.message));
                }
                
                if (alreadyUsed) {
                    await session.abortTransaction();
                    return next(new AppError('Coupon Error', 400, 'Coupon already used by this user'));
                }

                const discountInfo = coupon.calculateDiscount(totalPrice);
                
                if (discountInfo.valid) {
                    totalPrice = discountInfo.finalPrice;
                    appliedCoupon = coupon._id;
                    
                    coupon.usedCount += 1;
                    coupon.usedBy.push({
                        user: userId,
                        usedAt: new Date()
                    });
                    await coupon.save({ session });
                } else {
                    await session.abortTransaction();
                    return next(new AppError('Coupon Error', 400, discountInfo.message));
                }
            } else {
                await session.abortTransaction();
                return next(new AppError('Coupon Error', 400, 'Invalid or inactive coupon'));
            }
        }

        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity
        }));

        const order = await Order.create([{
            user: userId,
            items: orderItems,
            totalPrice: Math.round(totalPrice * 100) / 100, 
            shippingAddressId,
            appliedCoupon 
        }], { session });

     
        for (const item of cart.items) {
            const updateResult = await Product.findOneAndUpdate(
                { 
                    _id: item.product._id,
                    stock: { $gte: item.quantity }
                },
                { $inc: { stock: -item.quantity } },
                { 
                    new: true, 
                    session,
                    runValidators: true 
                }
            );

            if (!updateResult) {
                throw new Error(`Failed to reserve stock for ${item.product.name}. Product may have been purchased by another user.`);
            }
        }

        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();

        res.status(201).json({
            status: "Success",
            message: "Order placed successfully",
            order: order[0],
            totalPrice: Math.round(totalPrice * 100) / 100,
            appliedDiscount: appliedCoupon ? true : false
        });

    } catch (err) {
        await session.abortTransaction();
        console.error('Order placement failed:', err);
        next(err);
    } finally {
        await session.endSession();
    }
};
const createCheckoutSession= async (req,res,next) => {
    try {
        const userId= req.user.id;
        const userEmail=req.user.email
        const {shippingAddressId, couponCode}= req.body;
        
        const cart= await Cart.findOne({user: userId}).populate('items.product')
        if(!cart || cart.items.length === 0) {
            return next(new AppError('Error',400,'Your cart is empty'))
        }
        const line_items = cart.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product.name
                },
                unit_amount: Math.round(item.product.price * 100)
            },
            quantity: item.quantity
        }));
        
        // Calculate total and apply coupon if provided
        let cartTotal = cart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
        
        let discountAmount = 0;
        let appliedCouponId = null;
        
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            
            if (coupon && coupon.isActive  && coupon.isUsedByUser(userId)) {
                const discountInfo = coupon.calculateDiscount(cartTotal);
                
                if (discountInfo.valid) {
                    discountAmount = discountInfo.discountAmount;
                    appliedCouponId = coupon._id.toString();
                }
            }
        }
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            client_reference_id: userId,
            customer_email: userEmail,
            metadata: {
                shippingAddressId,
                couponId: appliedCouponId || '',
                couponCode: couponCode || '',
                discountAmount: discountAmount.toString()
            },
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/cancel`
    });

        
        res.status(200).json({
            status: 'Success',
            url: session.url
        })
    } catch(err) {
        next(err)
    }
}
const webhookStripe = async (req,res,next)  => {
    try {
        let event;
        try{
            const sig= req.headers['stripe-signature'];
             event= stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET)
        } catch (err) {
            return res.status(400).json({
                status: 'Fail',
                message: `Webhook Error ${err.message}`
            })
        }
        if(event.type === 'checkout.session.completed') {
            const session= event.data.object;
            const userId= session.client_reference_id;
            let cart= await Cart.findOne({user: userId}).populate('items.product')
            if(cart) {
                await Order.create({
                    user: userId,
                    items: cart.items,
                    totalPrice: session.amount_total/ 100,
                    shippingAddressId: session.metadata.shippingAddressId,
                    status: 'paid',
                    paymentStatus: 'paid',
                    paymentIntentId: session.payment_intent,
                    paymentMethod: 'card'
                })
                
                for(const item of cart.items) {
                      await Product.findByIdAndUpdate(item.product._id,
                      { $inc: {stock: -item.quantity}},{new: true})
                }

                await sendTestEmail({
                    email: session.customer_email,
                    subject: 'Payment Confirmation',
                    html: `<p>Your payment of $${(session.amount_total/ 100).toFixed(2)} was successful<p> `
                })
                cart.items= [];
                await cart.save();
            }
            console.log('Order created for user: ',userId)
        }
        if(event.type=== 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object;
            console.warn('Payment failed for intent:', paymentIntent.id);
        }
        res.status(200).json({ received: true });
    } catch(err) {
        next(err)
    }
}


const viewOrder= async (req,res,next) => {
    try {
        const userId= req.user.id;
        const order=await Order.find({user: userId})
        if (!order || order.length === 0) {
            return next(new AppError('Error', 404, "Order not found"))
        }
        res.status(200).json({
            status: "Success",
            order
        })
    } catch(err) {
        next(err)
    }
}
const getAllOrders= async (req,res,next) => {
    try {
        const orders= await Order.find().populate('user').populate('items.product')

        if(!orders) {
            return next(new AppError("Error",404,"Orders not found"))
        }
        res.status(200).json({
            status: "Success",
            orders
        })

    } catch(err) {
        next(err)
    }
}

const updateOrderStatus= async (req,res,next) => {
    try {
        const id= req.params.id;
        const { status }= req.body;
        const allowedStatus= ['pending','paid','shipped','delivered','cancelled']
        if(!allowedStatus.includes(status)) {
            return next(new AppError('Error',400,"Invalid status"))
        }
        const order= await Order.findByIdAndUpdate(id, {status},{new: true, runValidators: true}).populate('user').populate('items.product')
        if(!order) {
            return next(new AppError('Error',400,"There is no order"))
        }
        res.status(200).json({
            status: "Success",
            message: order
        })

    } catch(err) {
        next(err)
    }

}
module.exports= {placeOrder,createCheckoutSession, webhookStripe,viewOrder,getAllOrders,updateOrderStatus}