const mongoose=require('mongoose');
    
const reviewSchema= new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true,'Review must belong to a product']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true,'Review must belong to a user']
    },
    rating: {
        type: Number,
        required: [true,'Rating is required'],
        min: [1,'Rating must be atleast 1'],
        max: [5,'Rating cannot be more than 5']
    },
    title: {
        type: String,
        required: [true,'Review title is required'],
        maxlength: [100,'Title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true,'Review comment is required'],
        maxLength: [500,'Comment cannot exceed 500 characters']
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    }
    
},{timestamps: true, versionKey: false})


reviewSchema.index({product: 1,user: 1}, {unique: true})


reviewSchema.statics.calculateAverageRating= async function (productId) {
    const stats = await this.aggregate([
        {$match: {product: productId}},
        { $group: {
            _id: '$product',
            averageRating: {$avg: '$rating'},
            numberOfReviews: {$sum: 1}
        }}
    ]);
    if(stats.length>0) {
        await mongoose.model('Product').findByIdAndUpdate(productId,
            {
                averageRating: Math.round(stats[0].averageRating*10)/10,
                numberOfReviews: stats[0].numberOfReviews
            }
        )
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            averageRating: 0,
            numberOfReviews: 0
        })
    }
    
}

reviewSchema.post('save',async function () {
    await this.constructor.calculateAverageRating(this.product);
})


reviewSchema.post('findOneAndUpdate', async function(doc) {
    if(doc) {
        await doc.constructor.calculateAverageRating(doc.product)
    }
    
})

reviewSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.product);
    }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;



























    