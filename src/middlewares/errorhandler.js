const AppError = require("../utils/appError")


const errorHandler= (err,req,res,next) => {
      if(err.name==='ValidationError') {
        const errors=Object.fromEntries(Object.values(err.errors).map((err) => [err.path,err.message]))
        const appError=new AppError('Error',400,errors)
        return res.status(appError.statusCode).json({
            status: appError.status,
            message: appError.message
        })
    }
    if (err.code === 11000) {
        const fields = err.keyValue ? Object.keys(err.keyValue) : [];
        const msg = fields.length ? `${fields.join(', ')} already exists` : 'Duplicate key error';
        const appError = new AppError('Error', 400, msg);
        return res.status(appError.statusCode || 400).json({
            status: appError.status || 'Error',
            message: appError.message,
            details: err.keyValue || undefined
        })
    }
    if(err.name==='CastError'){
        const appError=new AppError('Error',400,`Invalid Id : ${err.value}`)
        return res.status(appError.statusCode).json({
            status: appError.status,
            message: appError.message
        })
    }
    return res.status(err.statusCode|| 500).json({
        status: err.status || 'Error',
        message: err.message
    })
}
module.exports= errorHandler