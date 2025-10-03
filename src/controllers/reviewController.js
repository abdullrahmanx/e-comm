const Review=require('../models/reviewModel');
const Product=require('../models/productModel');
const AppError = require('../utils/appError');

const createReview= async (req,res,next) => {
    try {
        const {productId,rating,title,comment} = req.body;
        const userId= req.user.id;
        const product= await Product.findById(productId);
        if(!product) {
            return next(new AppError('Error',404,'Product not found'))
        }

        const existingReview= await Review.findOne({
            product: productId,
            user: userId
        })
        if(existingReview) {
            return next(new AppError('Error',400,'You have already reviewed this product'))
        }
        
        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            title,
            comment
        })
        res.status(201).json({
            status: 'Success',
            message: 'Review created successfully',
            data: review
        })

    } catch(err) {
        next(err)
    }
}
const getProductReviews= async(req,res,next) => {
    try {
        const productId= req.params.id;
        const reviews= await Review.find({product: productId})
        .populate('user', 'name avatar')
        .populate('product','name price images')
        .sort('-createdAt')
        if(!reviews) {
            return next(new AppError('Error',404,'There is no Reviews for this product'))
        }
        res.status(200).json({
            status: 'Success',
            results: reviews.length,
            data: reviews
        })
    } catch(err) {
        next(err)
    }
}
const getMyReviews= async (req,res,next) => {
    try {
        const userId= req.user.id;
        const review= await Review.find({user: userId}).populate('product', 'name price images')
        if(!review) {
                return next(new AppError('Error',404,'There is no Reviews'))
        }
        res.status(200).json({
            status: "Success",
            data: review
        })
    } catch(err) {
        next(err)
    }
}

const updateReview= async (req,res,next) => {
    try {
        const reviewId= req.params.id;

        const userId= req.user.id;

        const {rating,title,comment}= req.body;

        const review= await Review.findById(reviewId)
        if(!review) {
            return next(new AppError('Error',404,'Review not found'))
        }
        if(review.user.toString() !== userId) {
            return next(new AppError('Error',400,'You can only edit ur own reviews'))
        }
        const updatedReview= await Review.findByIdAndUpdate(reviewId, {
            rating,
            title,
            comment
        }, {new: true, runValidators: true});
        
        res.status(200).json({
            status: 'Success',
            message: 'Review updated successfully',
            data: updatedReview
        })
    } catch(err) {
        next(err)
    }
}
const deleteReview= async (req,res,next) => {
    try {
        const reviewId= req.params.id;

        const userId= req.user.id;

        const review= await Review.findById(reviewId);

        if(!review) {
            return next(new AppError('Error',404,'Review not found'))
        }

        if(review.user.toString() !== userId) {
            return next(new AppError('Error',400,'You can only delete ur own reviews'))
        }

        const deleteReview= await Review.findByIdAndDelete(reviewId);
        res.status(200).json({
            status: 'Success',
            message: 'Review Deleted successfully',
    })
    }   catch(err) {
        next(err)
    }

}
module.exports= {createReview,getProductReviews,getMyReviews,updateReview,deleteReview}