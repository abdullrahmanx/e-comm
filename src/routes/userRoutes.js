const express= require('express');
const router=express.Router();
const controller=require('../controllers/userController');
const authorizedRoles = require('../middlewares/authorizedRoles');
const verifyToken=require('../middlewares/verifyToken');
const {validateLogin}= require('../middlewares/userJoiValidator');
const {validateSignup}=require('../middlewares/userJoiValidator');
const {validateProfile}=require('../middlewares/userJoiValidator')
const {avatar}=require('../middlewares/uploadImage')
    
router.get('/admin',verifyToken,authorizedRoles('admin'), (req,res) => {
    res.status(200).json("Welcome")
})

router.get('/me',verifyToken,controller.userProfile)
router.put('/me',verifyToken,validateProfile,avatar.single('image'),controller.updateProfile)


router.get('/addresses',verifyToken,controller.getAddress)
router.post('/addresses',verifyToken,controller.addAddress)
router.put('/addresses/:id',verifyToken,controller.updateAddress)
router.delete('/addresses/:id',verifyToken,controller.deleteAddress)


module.exports= router