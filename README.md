# E-Commerce REST API

**Version 1.1.0** - A robust and secure RESTful API for e-commerce applications built with Node.js, Express, and MongoDB.

## What's New (v1.1.0)
- Coupon/Promo Code System - Complete discount management
- API Versioning - All endpoints now under `/api/v1/`
- Health Check Endpoint - Monitor API status
- Testing Infrastructure - Jest testing setup
- Improved Code Quality - Bug fixes and optimizations

## Features

### Core Features
- **Authentication & Authorization** - JWT-based secure authentication
- **User Management** - Profile management, addresses, password reset
- **Product Management** - Full CRUD operations with image uploads
- **Shopping Cart** - Add, update, and remove items
- **Wishlist** - Save products for later
- **Order Management** - Place and track orders
- **Payment Integration** - Stripe payment processing
- **Image Management** - Cloudinary integration for product images
- **Coupon System** - Create and manage discount codes, promotions
- **Review System** - Product ratings and reviews with auto-calculation

### Security Features
- Password encryption with bcrypt
- Rate limiting to prevent abuse
- Helmet.js for security headers
- MongoDB injection sanitization
- HTTP Parameter Pollution protection
- Input validation with Joi

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Stripe Account
- Cloudinary Account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abdullrahmanx/e-commerce.git
cd e-commerce
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Server Configuration
PORT=3000

# Database
MONGOO_URL=mongodb://localhost:27017/ecommerce

# JWT Secret
JWT_KEY=your_super_secret_jwt_key_here

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Stripe Configuration
SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Ethereal for testing)
# Get free test account at https://ethereal.email/
ETHEREAL_USER=your_ethereal_user@ethereal.email
ETHEREAL_PASS=your_ethereal_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

4. **Start the server**
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check
```http
GET /health
```

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/signup
Content-Type: multipart/form-data

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "image": "file (optional)"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/v1/users/me
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "John Updated",
  "email": "john@example.com",
  "image": "file (optional)"
}
```

#### User Addresses
```http
GET /api/v1/users/addresses
POST /api/v1/users/addresses
PUT /api/v1/users/addresses/:id
DELETE /api/v1/users/addresses/:id
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/v1/products
```

#### Get Single Product
```http
GET /api/v1/products/:id
```

#### Create Product (Admin Only)
```http
POST /api/v1/products
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "category": "Electronics",
  "images": "files[]"
}
```

#### Update Product (Admin Only)
```http
PUT /api/v1/products/:id
Authorization: Bearer <admin_token>
```

#### Delete Product (Admin Only)
```http
DELETE /api/v1/products/:id
Authorization: Bearer <admin_token>
```

#### Upload Product Images (Admin Only)
```http
POST /api/v1/products/:id/images
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Cart Endpoints

#### Get Cart
```http
GET /api/v1/cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/v1/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/v1/cart/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/v1/cart/items/:id
Authorization: Bearer <token>
```

### Wishlist Endpoints

#### Get Wishlist
```http
GET /api/v1/wishlist
Authorization: Bearer <token>
```

#### Add to Wishlist
```http
POST /api/v1/wishlist/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here"
}
```

#### Remove from Wishlist
```http
DELETE /api/v1/wishlist/items/:id
Authorization: Bearer <token>
```

### Order Endpoints

#### Get My Orders
```http
GET /api/v1/orders/my-orders
Authorization: Bearer <token>
```

#### Place Order
```http
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [],
  "shippingAddress": {},
  "paymentMethod": "stripe"
}
```

#### Get All Orders (Admin Only)
```http
GET /api/v1/orders
Authorization: Bearer <admin_token>
```

#### Update Order Status (Admin Only)
```http
PUT /api/v1/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

### Coupon Endpoints

#### Get Available Coupons
```http
GET /api/v1/coupons/available
Authorization: Bearer <token>
```

#### Apply Coupon
```http
POST /api/v1/coupons/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SUMMER2024"
}
```

#### Create Coupon (Admin Only)
```http
POST /api/v1/coupons
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "SUMMER2024",
  "description": "Summer sale discount",
  "discountType": "percentage",
  "discountValue": 20,
  "minimumPurchase": 50,
  "validUntil": "2024-08-31"
}
```

#### Manage Coupons (Admin Only)
```http
GET /api/v1/coupons
GET /api/v1/coupons/:id
PUT /api/v1/coupons/:id
DELETE /api/v1/coupons/:id
PATCH /api/v1/coupons/:id/toggle
Authorization: Bearer <admin_token>
```

### Checkout Endpoints

#### Create Checkout Session
```http
POST /api/v1/checkout/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddressId": "address_id_here",
  "couponCode": "SUMMER2024"
}
```

### Review Endpoints

#### Add Review
```http
POST /api/v1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "rating": 5,
  "comment": "Great product!"
}
```

#### Get Product Reviews
```http
GET /api/v1/reviews/product/:productId
```

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Payment Processing**: Stripe
- **Image Storage**: Cloudinary
- **File Upload**: Multer
- **Caching**: Redis
- **Validation**: Joi
- **Security**: Helmet, express-rate-limit, hpp, express-mongo-sanitize
- **Email**: Nodemailer
- **Logging**: Winston
- **CORS**: cors

## Project Structure

```
e-commerce-api/
├── controllers/       # Request handlers
├── models/           # Mongoose models
├── routes/           # API routes
├── middlewares/      # Custom middlewares
├── utils/            # Utility functions
├── config/           # Configuration files
├── .env              # Environment variables (not in repo)
├── .env.example      # Environment template
├── .gitignore        # Git ignore file
├── server.js         # Entry point
├── package.json      # Dependencies
└── README.md         # Documentation
```

## Error Handling

The API uses a centralized error handling middleware that catches:
- Validation errors
- Duplicate key errors
- Cast errors (invalid MongoDB IDs)
- Custom application errors

All errors return a consistent JSON format:
```json
{
  "status": "Error",
  "message": "Error description"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Add unit and integration tests
- [ ] Implement webhook notifications for order updates
- [ ] Add support for multiple payment methods
- [ ] Product recommendations engine
- [ ] Inventory management system
- [ ] Email notifications for orders
- [ ] Admin dashboard
- [ ] Export order history (CSV/PDF)

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Abdullrahman**
- GitHub: [@abdullrahmanx](https://github.com/abdullrahmanx)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Note**: This is a demonstration project. For production use, ensure proper security audits, PCI compliance for payment processing, and additional features like proper logging, monitoring, and backup strategies.
