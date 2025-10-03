const mongoose=require('mongoose')

const productSchema= mongoose.Schema({
    name: {
        type: String,
        required: [true,"Product name is required"],
        trim: true,
        unique: true,
        maxLength: [100,"Product name must be less than 100 characters"]
    },
    description: {
        type: String,
        required: [true,"Product description is required"]
    },
    price: {
        type: Number,
        required: [true,"Product price is required"],
        max: [999999,"Price cannot be more than 6 digits"]        
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"]
    },
    stock: {
        type: Number,
        required: [true,"Stock is required"]
    },
    category: {
        type: String,
        required: [true,"Product category is required"]
    },
    brand: {
        type: String,
        default: "Generic"
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: String,
            url: String,
        }]
}, {timestamps: true, versionKey: false} 
)


productSchema.virtual('finalPrice').get(function() {
    if (this.discount > 0) {
        const discountAmount = this.price * this.discount / 100;
        return Math.round(this.price - discountAmount);
    }
    return this.price;
});

productSchema.methods.checkStock= function (quantity) {
    if(this.stock< quantity) {
        return {available: false,
        message: `Only ${this.stock} items is available in stock`,
        availableStock: this.stock}
    }
    return { available: true,
        message: 'Stock available',
        availableStock: this.stock
    }
}
productSchema.methods.reserveStock= async function(quantity) {
    if (this.stock < quantity) {
        throw new Error(`Insufficient stock. Only ${this.stock} available`);
    }
    this.stock -= quantity;
    await this.save();
    return this;
}
productSchema.methods.realeaseStock= async function(quantity) {
    this.stock+= quantity;
    await this.save();
    return this;
}


productSchema.set('toJSON', { virtuals: true });

const Product= mongoose.model('Product',productSchema)
module.exports= Product

