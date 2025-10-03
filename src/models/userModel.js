const mongoose=require('mongoose')
const validator = require('validator');
const bcrypt=require('bcrypt');
const crypto=require('crypto')
const userSchema= new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email address"
        }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['customer','admin','seller'],
        default: 'customer'
    },
    avatar: {
        id:  String,
        url : String
    },
    phone: {
        type: String
    },
    address: [{
        label: { type : String, required: [true,'Label cannot be empty']},
        country: {
            type: String,
            required: [true,'Country cannot be empty']
        },
        city: {
            type: String,
            required: [true,'City cannot be empty']
        },
        street: {
            type: String,
            required: [true,'Street cannot be empty']
        },
        type: {
            type: String,
            enum: ["shipping", "billing"],
            default: 'shipping'
        }
     
    }],
    emailVerified: {
        type: Boolean,
        default: false
    },
    wishList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
   
},
    {timestamps: true, versionKey: false },
    
);
userSchema.pre('save', async function(next)  {
    if(!this.isModified('password')) {
        return next()
    }
    this.password= await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.createPasswordResetToken= function() {
    const resetToken= crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken= crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    this.resetPasswordExpire= Date.now() + 10 * 60 * 1000; 
    return resetToken;
}




const User= mongoose.model('User',userSchema)
module.exports=User