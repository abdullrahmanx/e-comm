const express=require('express')
const route=express.Router();
const verifyToken=require('../middlewares/verifyToken')
const controller=require('../controllers/orderController')
const authorizedRoles= require('../middlewares/authorizedRoles')


route.get('/',verifyToken,authorizedRoles('admin'),controller.getAllOrders)
route.get('/my-orders',verifyToken,controller.viewOrder)

route.post('/',verifyToken,controller.placeOrder)
route.put('/status/:id',verifyToken,authorizedRoles('admin'),controller.updateOrderStatus)




module.exports= route