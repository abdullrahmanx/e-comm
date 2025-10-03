const Joi= require('joi')

const schema= Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Product name must be atleast 3 character',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
    }),
    description: Joi.string().min(10).required().messages({
        'string.empty': 'Product description cannot be empty',
        'string.min': 'Product description must be atleast 10 characters',
        'any.required': 'Product description is required'
    }),
    price: Joi.number().min(0).max(999999).required().messages({
        'number.base': 'Price cannot be empty',
        'number.min': 'Price must be a positive number',
        'number.max': 'Price cannot exceed 999999',
        'any.required': 'Price is required'
    }),
    stock: Joi.number().integer().min(1).required().messages({
        'number.base': 'Stock quantity cannot be empty',
        'number.integer': 'Stock must be an integer',
        'number.min': 'Stock must be a positive number',
        'any.required': 'Stock quantity is required'
    }),
    category: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Category cannot be empty',
        'any.required': 'Product category is required'
    }),
    images: Joi.array().items(Joi.string()).optional()
})
const validateProduct= (req,res,next) => {
    const {error}= schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });
    if(error) {
        const erros= error.details.map(err => err.message)
        return res.status(400).json({
            status: 'Error',
            message: erros
        });
    }
    next();
}
module.exports= validateProduct;
