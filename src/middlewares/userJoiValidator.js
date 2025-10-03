const Joi= require('joi')

const signupSchema= Joi.object({
    name: Joi.string().min(3).max(20).required().messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be atleast 3 characters',
        'string.max': 'Name cannot exceed 20 characters',
        'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be atleast 6 characters',
        'any.required': 'Passowrd is required'
    }),

})
const loginSchema= Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email cannot be empty',
        'any.required': 'Emailc is required'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password cannot be empty',
        'any.required': 'Passowrd is required'
    })
})
const updateProfileSchema= Joi.object({
    name: Joi.string().min(3).max(20).messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be atleast 3 characters',
        'string.max': 'Name cannot exceed 20 characters',
        'any.required': 'Name is required'
    }),
    phone: Joi.string().optional().messages({
        'string.empty': 'Phone cannot be empty'
    }),
    avatar: Joi.object({
        id: Joi.string().messages({
            'string.base': 'Avatar id must be a string'
        }),
        url: Joi.string().uri().messages({
            'string.base': 'Avatar url must be a string',
            'string.uri': 'Avatar url must be a valid URL'
        })
    }).messages({
        'object.base': 'Avatar must be an object'
    })
    .or('name','phone','avatar')
    .messages({
        'object.missing': 'Provide atleast one of: name, phone, avatar'
    })
})


const validateProfile= (req,res,next) => {
    const {error} = updateProfileSchema.validate(req.body, {
        abortEarly: false
    })
    if(error) {
        const errors= error.details.map(err => err.message)
        return res.status(400).json({
            status: 'Error',
            message: errors
        })
    }
    next();
}





const validateLogin= (req,res,next) => {
    const {error} = loginSchema.validate(req.body, {
        abortEarly: false
    })
    if(error) {
        const errors= error.details.map(err => err.message)
        return res.status(400).json({
            status: 'Error',
            message: errors
        })
    }
    next();
}

const validateSignup= (req,res,next) => {
    const {error} = signupSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    })
    if(error) {
        const errors= error.details.map(err => err.message)
        return res.status(400).json({
            status: 'Error',
            message: errors
        })
    }
    next();
}
module.exports= {validateSignup,validateLogin,validateProfile}