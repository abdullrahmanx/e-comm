require("dotenv").config();
const cloudinary=require('cloudinary').v2;
const multer=require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const AppError = require('../utils/appError');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage2= new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'user-avatar',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
})




const storage=  new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products",
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});
const fileFilter= (req,file,cb) => {
    if(file.mimetype.startsWith('image/')) {
        cb(null,true)
    } else {
        cb(new Error("Only images are allowed"), false)
    }
}
const avatar= multer({storage :storage2,fileFilter})
const upload= multer({storage,fileFilter})

module.exports= {upload,avatar}





