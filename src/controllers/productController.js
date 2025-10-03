
const Product = require("../models/productModel");
const AppError = require("../utils/appError");
const cloudinary=require('../middlewares/uploadImage')
const createProduct= async (req,res,next) => {
    try {
    let { name, description, price, stock, category} = req.body;
    let images= [];
    if(req.files) {
        images= req.files.map((img) => ({
            public_id: img.filename,
            url : img.path
        }))
    }
    const newProduct = await Product.create({name, description,price,stock,category,images});
    res.status(201).json({
        status: "Success",
        message: newProduct
    })
    } catch (err) {
        next(err)
    }
}

const getAllProducts= async (req,res,next) => {
    try {
        let filterConditions= {};
        if(req.query.keyword) {
            filterConditions.name= { $regex: req.query.keyword, $options: "i"}
        }
        if(req.query.category) {
            filterConditions.category= { $regex: req.query.category, $options: "i"}
        }
        if(req.query.minPrice || req.query.maxPrice) {
            filterConditions.price= {};
            if(req.query.minPrice) {
                filterConditions.price.$gte=Number(req.query.minPrice)
            }
            if(req.query.maxPrice) {
                filterConditions.price.$lte=Number(req.query.maxPrice)
            }
        }
        let sortOrder= req.query.sort || "-createdAt";
        const total = await Product.countDocuments(filterConditions)

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const products = await Product.find(filterConditions).sort(sortOrder).skip(skip).limit(limit)
        if(!products) {
            return next(new AppError('Error',404,'Products not found'))
        }
        res.status(200).json({
            status: 'Success',
            items: products,
            total,
            limit,
            page,
            totalPages: Math.ceil(total/limit)
        })

    }catch (err) {
        next(err)
    }
}

const getProduct= async (req,res,next) => {
    try {
        const product= await Product.findById(req.params.id);
        if(!product) {
            return next(new AppError('Error',404,"Product not found"))
        }
        res.status(200).json({
            status: "Success",
            message: product
        })    
    } catch(err) {
        next(err)
    }

}
const updateProduct= async (req,res,next) => {
    try {
        const product= await Product.findByIdAndUpdate(req.params.id,
        {...req.body},{new: true,runValidators: true})
        if(!product) {
            return next(new AppError('Error',404,"Product not found"))
        }
        res.status(200).json({
            status: "Success",
            message: product
        })
    } catch(err) {
        next(err)
    }
}
const deleteProduct= async(req,res,next) => {
    try {
        const product= await Product.findByIdAndDelete(req.params.id)
        if(!product) {
            return next(new AppError('Error',404,"Product not found"))
        }
        res.status(200).json({
            status: "Success",
            message: "Product deleted"
        })

    } catch(err) {
        next(err)
    }
}
const uploadProductImage= async (req,res,next) => {
    try {
        if(!req.files || req.files.length === 0) {
            return next(new AppError('Error',400,"You didnt upload an image"))
        }   
        const newImages = req.files.map(f => ({ public_id: f.filename, url: f.path }));
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $push: { images: { $each: newImages } } },
            {new:true, runValidators: true}
        )
        if(!product) {
            return next(new AppError('Error',404,"Product not found"))
        }    
        res.status(200).json ({
            status: "Success",
            product
        })

     } catch (err) {
         next(err)
     }
}   



module.exports= {createProduct,getAllProducts,getProduct,updateProduct,deleteProduct,uploadProductImage}
