
class AppError extends Error {
    constructor(status,statusCode,message) {
        super()
        this.status=status,
        this.statusCode=statusCode,
        this.message=message
    }
}
module.exports= AppError;