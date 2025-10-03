const User= require('../models/userModel')
const AppError = require('../utils/appError')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const sendEmail= require('../utils/email')
const crypto= require('crypto')

const signUp= async (req,res,next) => {
    try {
    const {name,email,password}=req.body    
    if(req.body.role) {
        return next(new AppError('Error',401,"You cant choose your role"))
    }
    let avatar= {}
    if(req.file) {
        avatar.id=req.file.filename,
        avatar.url=req.file.path
    }
    const emailExists= await User.findOne({email})
    if(emailExists) {
        return next(new AppError('Error',400,"Email already exists"))
    }

    const newUser= await User.create({name,email,password,avatar})
    res.status(201).json({
        status: "Success",
        data: {
            name: newUser.name,
            role: newUser.role,
            avatar: newUser.avatar || null
        }
    })
    }  catch (err) {
    next(err)
    }
}
const login= async (req,res,next) => {
    try {
        const {email,password}=req.body
        if(!email || !password) {
            return next(new AppError('Error',400,"Email and Password are required"))
        }
        const user= await User.findOne({email}).select('+password')

        if(!user) {
            return next(new AppError("Error",400,"Incorrect email or password"))
        }
        const comparePassword= await bcrypt.compare(password,user.password)
        if(!comparePassword) {
            return next(new AppError('Error',400,"Incorrect password"))
        }
        const token= jwt.sign({id: user._id,role: user.role,email: user.email}, process.env.JWT_KEY, {expiresIn: '1h'})
        res.status(200).json({
            status: "Success",
            token
        })
    }catch (err) {
        next(err)
    }
}

const changePassword= async (req,res,next) => {
    try {
        const userId= req.user.id;
        const user= await User.findById(userId).select('+password')

        const {currentPassword, newPassword}= req.body;

        if(!currentPassword || !newPassword) {
            return next(new AppError('Error',400,"Current and New password are required"))
        }
        if(currentPassword === newPassword) {
            return next (new AppError('Error',400,"Current and New cannot be the same"))
        }
        const isMatch= await bcrypt.compare(currentPassword,user.password)
        if(!isMatch) {
            return next(new AppError('Error',400,'Your current password is wrong'))
        }
        

        user.password= newPassword;
        const token= jwt.sign({id: user._id,role: user.role, email: user.email}, process.env.JWT_KEY,{expiresIn: '2h'})

        await user.save({validateBeforeSave: false})

    
        res.status(200).json({
            status: 'Success',
            message: 'Password changed successfully'
        })
    } catch(err) {
     next(err)
    }

}

const forgotPassword = async (req,res,next) => {
    try {
        const {email}= req.body;
        const user= await User.findOne({email})
        if(!user) {
            return next(new AppError("Error",400,"Incorrect email or password"))
        }
        const resetToken= user.createPasswordResetToken();
        await user.save({validateBeforeSave: false}) 

        const resetURL= `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Link (valid for 10 minutes)',
            html: `<p>Your password reset link: ${resetURL}<p>`
        })
        res.status(201).json({
            status: 'Success',
            message: 'Check you mail box'
        })
    } catch(err) {
        next(err)
    } 

}

const resetPassword = async (req,res,next) => {
    try {
        const resetToken= req.params.token;

        const hashedToken= await crypto.createHash('sha256').update(resetToken).digest('hex')

        const user= await User.findOne({resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now()}})

        if(!user) {
            return next(new AppError("Error",404,"User not found"))
        }

        const {newPassword,confirmPassword} = req.body;

        if(!newPassword || !confirmPassword) {
            return next(new AppError('Error',400,"New Password and confirmation are required"))
        }

        user.password= newPassword;
        const token= jwt.sign({id: user._id,role: user.role,email: user.email},process.env.JWT_KEY,{expiresIn: '2h'})
        user.resetPasswordToken= undefined;
        user.resetPasswordExpire= undefined;
        await user.save();


        res.status(200).json({
            status: 'Success',
            message: 'Password has been reset successfully',
            token
        })
    } catch (err) {
        next(err)
    }
}


const userProfile = async (req,res,next) => {
    try {
        const userId= req.user.id;
        const user= await User.findById(userId);

        if(!user) {
            return next(new AppError('Error',404,"User not found"));
        }
        res.status(200).json({
            status: "Success",
            data : {
                name: user.name,
                email: user.email,
                role: user.role,
                wishList: user.wishList || [],
                avatar: user.avatar?.url || null,
                phone: user.phone,
                emailVerified: user.emailVerified,
            }
        })
    } catch(err) {
        next(err)
    }
}

const updateProfile = async (req,res,next) => {
    try {
        const userId= req.user.id ;

        const {name, avatar, phone}= req.body

        const updateData= {};

        if(name) updateData.name= name;

        if(req.file) {
            updateData['avatar.url']=req.file.path;
            updateData['avatar.id']=req.file.filename;
        }
        if(phone) updateData.phone= phone;

        const updatedProfile= await User.findByIdAndUpdate(userId,updateData,
            {new: true, runValidators: true}
        )
        if(!updatedProfile) {
            return next(new AppError('Error',404,"User not found"))
        }

        res.status(200).json({
            status: "Success",
            data: updatedProfile
        })
    } catch(err) {
        next(err)
    }
}
// 3ayz a5od address mn user we adefo 3ndy
const addAddress= async (req,res,next) => {
    const userId= req.user.id;
    const user = await User.findById(userId)
    if(!user) {
        return next(new AppError('Error',404,"User not found"))
    }
    const {address}= req.body;
    if(!address) {
        return next(new AppError('Error',400,"You need to enter your address")) 
    }
    user.address.push(address)
    await user.save();

    res.status(201).json({
        status: 'Success',
        data: user.address
    })
}
const getAddress= async (req,res,next) => {
    try {
        const userId= req.user.id;
        const user= await User.findById(userId)
        if(!user) {
            return next(new AppError('Error',404,"User not found"))
        }
        res.status(200).json({
            status: 'Success',
            data: user.address
        })
    } catch(err) {
        next(err)
    }

}
const updateAddress= async (req,res,next) => {
    try {
        const userId= req.user.id;

        const addressId= req.params.id;

        const {label,country,city,street,type}= req.body;

        const user= await User.findById(userId)

        if(!user) {
            return next(new AppError('Error',404,"User not found"))
        }
        const address= user.address.id(addressId)

        if (!address) {
            return next(new AppError('Error',404,"Address not found"))
        }

        if(label) address.label = label;

        if(country) address.country= country;

        if(city) address.city = city;

        if(street) address.street = street;

        if(type) address.type = type;

        await user.save();

        res.status(200).json({
            status: 'Success',
            data: address
        })
    } catch(err) {
        next(err)
    }
}

const deleteAddress= async (req,res,next) => {
    try {
        const userId= req.user.id
        const user= await User.findById(userId)
        if(!user) {
            return next(new AppError('Error',404,"User not found"))
        }
        const addressId= req.params.id
        user.address.pull({_id: addressId})  


        await user.save();

        res.status(200).json({
            status: 'Removed Successfully'
        })
    } catch(err) {
        next(err)
    }

}

module.exports = { signUp,login,changePassword,forgotPassword,resetPassword,
    userProfile,updateProfile,
    addAddress,getAddress,updateAddress,deleteAddress} 