const AppError = require("../utils/appError")

const authorizedRoles= (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('Error',403,"You are not authorized"))
        } else {
            next();
        }
    }
}

module.exports= authorizedRoles