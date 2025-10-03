const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const verifyToken = require('../middlewares/verifyToken');


router.post('/sessions', verifyToken, controller.createCheckoutSession);


router.get('/success', (req, res) => {
    res.send('Payment successful');
});
router.get('/cancel', (req, res) => {
    res.send('Payment cancelled');
});

module.exports = router;
