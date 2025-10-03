const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');
const { validateLogin } = require('../middlewares/userJoiValidator');
const { validateSignup } = require('../middlewares/userJoiValidator');
const { avatar } = require('../middlewares/uploadImage');


router.post('/signup', validateSignup, avatar.single("image"), controller.signUp);
router.post('/login', validateLogin, controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.put('/reset-password/:token', controller.resetPassword);
router.put('/change-password', verifyToken, controller.changePassword);

module.exports = router;
