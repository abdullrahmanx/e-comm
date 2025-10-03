const express = require('express');
const router = express.Router();
const controller = require('../controllers/userCartController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, controller.getWishList);
router.post('/:id', verifyToken, controller.addToWishList);
router.delete('/:id', verifyToken, controller.removeWishlist);

module.exports = router;
