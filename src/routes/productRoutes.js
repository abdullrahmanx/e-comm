const express=require('express')
const route=express.Router()
const controller=require('../controllers/productController')
const verifyToken = require('../middlewares/verifyToken')
const authorizedRoles=require('../middlewares/authorizedRoles')
const {upload}=require('../middlewares/uploadImage')
const  validateProduct  = require('../middlewares/productjoiValidator')



route.get('/',controller.getAllProducts)
route.get('/:id',controller.getProduct)
route.post('/',verifyToken,authorizedRoles('admin'),upload.array('image'),validateProduct,controller.createProduct)
route.post('/images/:id',verifyToken,authorizedRoles('admin'),upload.array('image'),controller.uploadProductImage)
route.put('/:id',verifyToken,authorizedRoles('admin'),controller.updateProduct)
route.delete('/:id',verifyToken,authorizedRoles('admin'),controller.deleteProduct)


module.exports=route