const express = require('express');
const router = express.Router();
const controller = require('../controllers/userCartController');
const verifyToken = require('../middlewares/verifyToken');
    



router.get('/', verifyToken, controller.showCart);
router.post('/items',verifyToken,controller.addToCart) 
router.put('/items/:id', verifyToken, controller.updateCart);
router.delete('/:id', verifyToken, controller.removeFromCart);

module.exports = router;
