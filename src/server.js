const express= require('express')
const app= express();
const mongoose=require('mongoose')
const authRoutes=require('./routes/authRoutes');
const checkoutRoutes=require('./routes/checkoutRoutes');
const wishlistRoutes=require('./routes/wishlistRoutes');             
const userRoutes=require('./routes/userRoutes');
const productRoutes=require('./routes/productRoutes');
const cartRoutes=require('./routes/cartRoutes');
const orderRoutes=require('./routes/orderRoutes');
const reviewRoutes=require('./routes/reviewRoutes');
const couponRoutes=require('./routes/couponRoutes');
const mongoSanitize=require('express-mongo-sanitize');
const hpp=require('hpp')
const cors=require('cors');
const helmet=require('helmet');
const limitRequests=require('./middlewares/rateLimit');
const errorHandler = require('./middlewares/errorhandler');
const { webhookStripe } = require('./controllers/orderController');
const dotenv=require('dotenv').config();

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("MongooDB connected")
})

app.set('trust proxy', 1);
app.use(helmet());
app.use(hpp())
app.use(cors({origin: process.env.FRONTEND_URL || 'http://localhost:3000'}));
app.use(mongoSanitize());
app.use(limitRequests);

app.post('/checkout/webhook', express.raw({ type: 'application/json' }), webhookStripe);

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true,limit: '10mb'}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        message: 'API is running smoothly'
    });
});

const apiV1 = express.Router();

apiV1.use('/auth', authRoutes);
apiV1.use('/users', userRoutes);
apiV1.use('/products', productRoutes);
apiV1.use('/cart', cartRoutes);
apiV1.use('/wishlist', wishlistRoutes);
apiV1.use('/orders', orderRoutes);
apiV1.use('/checkout', checkoutRoutes);
apiV1.use('/reviews', reviewRoutes);
apiV1.use('/coupons', couponRoutes);

app.use('/api/v1', apiV1);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
