const Product=require('../models/productModel')
const AppError = require('../utils/appError')
const User=require('../models/userModel')
const Cart=require('../models/cartModel')

const showCart= async (req,res,next) => {
    try {
        const userId=req.user.id
        let cart= await Cart.findOne({user:userId})

        if(!cart) cart= await Cart.create({user: userId, items: []});

        await cart.save()
        res.status(200).json({
            status: "Success",
            cart
        })
    }catch(err){
        next(err)
    } 

}
// hcheck lw el product da mwgod we hcheck el stock bta3o lw tmam h3mlo add
const addToCart= async (req,res,next) => {
    try {
        const {productId, quantity} = req.body;
        const userId= req.user.id
        if(!productId || quantity<= 0) {
            return next(new AppError('Error',400,'Product and quantity are required'))
        }
        const product= await Product.findById(productId);
        if(!product) {
            return next(new AppError('Error',404,'Product not found'))
        }
        const stockCheck= product.checkStock(quantity);
        if(!stockCheck.available){
            return next(new AppError('Error',400,`${stockCheck.message}`))
        }
        const cart= await Cart.findOne({user: userId});
        if(!cart) {
            const cart = new Cart({user: userId, items: []})
        }
        const existingProduct= cart.items.find((item) => item.product.toString()=== productId)
        if(existingProduct) {

            const totalQuantity= existingProduct.quantity+ quantity
            const totalStock= product.checkStock(totalQuantity)
            if(!totalStock.available) {
                return next(new AppError('Error',400,`${totalStock.message}`))
            }
            existingProduct.quantity=totalQuantity
        } else {
            cart.items.push({product: productId, quantity})
        }
        await cart.save();
        await cart.populate('items.product', 'name price stock images')

        res.status(200).json({
                    status: "Success",
                    message: 'Product added to cart successfully',
                    cart
                });
    } catch(err) {
        next(err)
    }
}
const updateCart= async (req,res,next) => {
    try {
        const productId= req.params.id;
        const {quantity} = req.body;
        const userId= req.user.id

        if (!quantity || quantity <= 0) {
            return next(new AppError('Error',400,'Valid quantity is required'))
        }
        const product= await Product.findById(productId)
        if(!product) {
            return next(new AppError('Error',404,'Product Not found'))
        }
        const stockCheck= product.checkStock(quantity)
        if(!stockCheck.available){
            return next(new AppError('Error',400,`${stockCheck.message}`))
        }
        const cart= await Cart.findOne({user: userId})
        if (!cart) {
            return next(new AppError('Error',404,'Cart Not found'))
        }
        const item= cart.items.find((item) => item.product.toString()=== productId);
        if(!item) {
            return next(new AppError('Error',404,'Item Not found'))
        }
        item.quantity= quantity;
        await cart.save();
        await cart.populate('items.product','name price stock images')
        res.status(200).json({
                    status: "Success",
                    message: 'Cart updated successfully',
                    cart
             });

    } catch(err) {
        next(err)
    }
}
const removeFromCart= async (req,res,next) => {
    try {
        const userId=req.user.id;
        
        const productId=req.params.id;

        let cart= await Cart.findOne({user: userId})

        if(!cart) return next(new AppError('Error',404,'Cart not found'));

        const productExists= cart.items.findIndex((item) => item.product.toString() ==productId)

        if(productExists<0) return next(new AppError('Error',404,'Product not found'));
         
        cart.items= cart.items.filter((item) => item.product.toString() !== productId)

        await cart.save();

        res.status(200).json({
            status: "Success",
            message: "Deleted From cart",
            cart
        })
    } catch(err) {
        next(err)
    }

}


const addToWishList= async (req,res,next) => {
    try {
    const productId=req.params.id 
    const product= await Product.findById(productId)
    if(!product) {
        return next(new AppError('Error',404,"Product not found"))
    }

    const user= await User.findById(req.user.id)
    if(!user) {
        return next(new AppError('Error',404,"User not found"))
    }

    if(user.wishList.includes(productId)) {
        return next(new AppError('Error',400,"Product already exists"))
    }
    user.wishList.push(productId)
    await user.save();
    res.status(200).json({
        status: "Success",
        message: "Product Added",
        wishList: user.wishList
    })
    } catch(err) {
        next(err)
    }
}
const removeWishlist= async (req,res,next) => {
    try {
    const productId=req.params.id
    const product= await Product.findById(productId)
    if(!product) {
        return next(new AppError('Error',404,"Product not found."))
    }

    const user= await User.findById(req.user.id)

    if(!user.wishList.includes(productId)) {
        return next(new AppError('Error',404,"Product not found."))
    }
    user.wishList= user.wishList.filter((id) => id.toString() !== productId)

    await user.save();

    res.status(200).json({
        status: "Success",
        message: "Deleted from your wishlist"
    })
    }catch (err) {
        next(err)
    }

}
const getWishList= async (req,res,next) => {
    try {
    const user= await User.findById(req.user.id)
    if(!user) {
        return next(new AppError('Error',404,"User not found"))
    }
    if(!user.wishList || user.wishList.length == 0) {
        return next(new AppError('Error',400,"Nothing in Wishlist"))
    }
    res.status(200).json({
        status: "Success",
        message: user.wishList
    })
    } catch(err) {
    next(err)
    }

}



module.exports= {addToWishList,removeWishlist,getWishList,addToCart,showCart,updateCart,removeFromCart}