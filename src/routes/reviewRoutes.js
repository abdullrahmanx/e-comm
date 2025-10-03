const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const verifyToken = require('../middlewares/verifyToken');





router.get('/me', verifyToken, controller.getMyReviews);

router.get('/:id', controller.getProductReviews);





router.post('/', verifyToken, controller.createReview);


router.put('/:id', verifyToken, controller.updateReview);

router.delete('/:id', verifyToken, controller.deleteReview);

module.exports = router;
