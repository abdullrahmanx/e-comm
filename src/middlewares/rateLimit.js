const {rateLimit,ipKeyGenerator}=require('express-rate-limit');

const limitRequests= rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req,res) => {
       const rt = req.rateLimit && req.rateLimit.resetTime;
       const resetMs = rt ? ((rt instanceof Date ? rt.getTime() : rt) - Date.now()) : 15*60*1000;
       const retryAfter = Math.max(1, Math.ceil(resetMs/1000));
       res.status(429).json({
        status: 'Error',
        message: 'Too many requests, please try again later',
        retryAfter,
        remainingRequests: req.rateLimit ? req.rateLimit.remaining : 0,  
    })
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
        return req.user ? req.user.id : ipKeyGenerator(req.ip)
    },
    errorCode: "RATE_LIMIT_EXCEED" 
})


module.exports= limitRequests
