/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Health checks and public utility endpoints.
 *   - name: Users
 *     description: Customer authentication, profile, avatar, and password recovery.
 *   - name: Cart
 *     description: Authenticated customer cart operations.
 *   - name: Favorites
 *     description: Authenticated customer wishlist operations.
 *   - name: Blogs
 *     description: Public blog reads and blog creation.
 *   - name: Products
 *     description: Public product discovery and customer reviews.
 *   - name: Home
 *     description: Homepage discovery data.
 *   - name: Orders
 *     description: Customer, seller, and admin order operations.
 *   - name: Payment
 *     description: Razorpay order creation, verification, and webhook handling.
 *   - name: Documents
 *     description: Invoice and shipping label documents.
 *   - name: Addresses
 *     description: Authenticated address book operations.
 *   - name: Contact
 *     description: Contact messages and contact-us form submissions.
 *   - name: Seller
 *     description: Seller authentication, onboarding, profile, products, dashboard, and stats.
 *   - name: Delivery
 *     description: Delivery partner authentication and task operations.
 *   - name: Admin
 *     description: Admin authentication, moderation, analytics, and rider approvals.
 *   - name: Notifications
 *     description: Notification read and delete operations.
 *   - name: Newsletter
 *     description: Newsletter subscription operations.
 *
 * components:
 *   parameters:
 *     MongoId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: 665f1c1b9f1a9f0012345678
 *     ProductId:
 *       name: productId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: 665f1c1b9f1a9f0012345678
 *     OrderId:
 *       name: orderId
 *       in: path
 *       required: true
 *       description: MongoDB order id or public order id such as OD175441357273612345.
 *       schema:
 *         type: string
 *         example: 665f1c1b9f1a9f0012345678
 *     AddressId:
 *       name: addressId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: 665f1c1b9f1a9f0012345678
 *     SellerId:
 *       name: sellerId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: 665f1c1b9f1a9f0012345678
 *     DeliveryTaskId:
 *       name: deliveryTaskId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: 665f1c1b9f1a9f0012345678
 *     TaskId:
 *       name: taskId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: 665f1c1b9f1a9f0012345678
 *     NotificationId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: 665f1c1b9f1a9f0012345678
 *   responses:
 *     Unauthorized:
 *       description: Missing, expired, or invalid bearer token.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Not authorized
 *     Forbidden:
 *       description: Authenticated user does not have permission for this resource.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Forbidden
 *     NotFound:
 *       description: Resource not found.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Resource not found
 *     ValidationError:
 *       description: Request validation failed.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Validation failed
 *     ServerError:
 *       description: Unexpected server error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             error: Server error
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Something went wrong
 *         error:
 *           type: string
 *           example: Server error
 *     AuthTokenResponse:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
 *     UserName:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *           example: Aman
 *         lastname:
 *           type: string
 *           example: Sharma
 *     User:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         fullname:
 *           $ref: '#/components/schemas/UserName'
 *         email:
 *           type: string
 *           format: email
 *           example: aman@example.com
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         avatar:
 *           type: string
 *           example: https://d571iltqpcj1f.cloudfront.net/avatars/avatar.png
 *     RegisterUserRequest:
 *       type: object
 *       required: [fullname, email, password]
 *       properties:
 *         fullname:
 *           $ref: '#/components/schemas/UserName'
 *         email:
 *           type: string
 *           format: email
 *           example: aman@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: StrongPass@123
 *         phone:
 *           type: string
 *           example: "9876543210"
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: aman@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPass@123
 *     EmailRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: aman@example.com
 *     VerifyOtpRequest:
 *       type: object
 *       required: [email, otp]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: aman@example.com
 *         otp:
 *           type: string
 *           example: "123456"
 *     SellerVerifyOtpRequest:
 *       type: object
 *       required: [sellerId, emailOtp]
 *       properties:
 *         sellerId:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         emailOtp:
 *           type: string
 *           example: "123456"
 *     ResetPasswordRequest:
 *       type: object
 *       required: [email, newPassword]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: aman@example.com
 *         otp:
 *           type: string
 *           example: "123456"
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: NewStrongPass@123
 *     UpdateUserProfileRequest:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *           example: Aman
 *         lastname:
 *           type: string
 *           example: Sharma
 *         phone:
 *           type: string
 *           example: "9876543210"
 *     Product:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         name:
 *           type: string
 *           example: Handmade Ceramic Lamp
 *         description:
 *           type: string
 *           example: A handcrafted lamp for home decor.
 *         category:
 *           type: string
 *           example: Home Decor
 *         subcategory:
 *           type: string
 *           example: Lamps
 *         sellingPrice:
 *           type: number
 *           example: 1199
 *         mrp:
 *           type: number
 *           example: 1299
 *         platformFee:
 *           type: number
 *           example: 0
 *         logisticsFee:
 *           type: number
 *           example: 60
 *         transactionFee:
 *           type: number
 *           example: 10
 *         discountPercentage:
 *           type: number
 *           example: 10
 *         inStock:
 *           type: integer
 *           example: 40
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://d571iltqpcj1f.cloudfront.net/SellerProducts/product.jpg"]
 *         approvalStatus:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Admin moderation state used by admin status badges.
 *           example: pending
 *         adminNotes:
 *           type: string
 *           example: Product images need better quality.
 *         badges:
 *           $ref: '#/components/schemas/ProductBadges'
 *         rating:
 *           type: number
 *           example: 4.6
 *         sellerId:
 *           oneOf:
 *             - type: string
 *               example: 665f1c1b9f1a9f0012349876
 *             - $ref: '#/components/schemas/AdminProductSeller'
 *     ProductListResponse:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *         totalCount:
 *           type: integer
 *           example: 120
 *     CartItemRequest:
 *       type: object
 *       required: [productId, quantity]
 *       properties:
 *         productId:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     UpdateCartItemRequest:
 *       type: object
 *       required: [quantity]
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     FavoriteRequest:
 *       type: object
 *       required: [productId]
 *       properties:
 *         productId:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *     Address:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         fullName:
 *           type: string
 *           example: Aman Sharma
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         addressLine1:
 *           type: string
 *           example: House 10
 *         addressLine2:
 *           type: string
 *           example: Near Metro
 *         city:
 *           type: string
 *           example: Noida
 *         state:
 *           type: string
 *           example: UP
 *         postalCode:
 *           type: string
 *           example: "201301"
 *         country:
 *           type: string
 *           example: India
 *         isDefault:
 *           type: boolean
 *           example: true
 *     AddressRequest:
 *       type: object
 *       required: [fullName, phone, addressLine1, city, state, postalCode, country]
 *       properties:
 *         fullName:
 *           type: string
 *           example: Aman Sharma
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         addressLine1:
 *           type: string
 *           example: House 10
 *         addressLine2:
 *           type: string
 *           example: Near Metro
 *         city:
 *           type: string
 *           example: Noida
 *         state:
 *           type: string
 *           example: UP
 *         postalCode:
 *           type: string
 *           example: "201301"
 *         country:
 *           type: string
 *           example: India
 *         isDefault:
 *           type: boolean
 *           example: true
 *     ShippingAddress:
 *       allOf:
 *         - $ref: '#/components/schemas/AddressRequest'
 *     OrderProductInput:
 *       type: object
 *       required: [product, quantity]
 *       properties:
 *         product:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     CreateOrderRequest:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           description: Optional. If omitted, the current user's cart is used.
 *           items:
 *             $ref: '#/components/schemas/OrderProductInput'
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         paymentMethode:
 *           type: string
 *           example: COD
 *         paymentStatus:
 *           type: string
 *           example: Pending
 *         deliveryStatus:
 *           type: string
 *           example: Pending
 *     Order:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         orderId:
 *           type: string
 *           example: OD175441357273612345
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             additionalProperties: true
 *         totalAmount:
 *           type: number
 *           example: 1499
 *         paymentMethode:
 *           type: string
 *           example: COD
 *         paymentStatus:
 *           type: string
 *           example: Pending
 *         deliveryStatus:
 *           type: string
 *           example: Pending
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *     CancelOrderRequest:
 *       type: object
 *       properties:
 *         cancelReason:
 *           type: string
 *           example: Changed my mind
 *         reason:
 *           type: string
 *           example: Changed my mind
 *     UpdateSellerItemStatusRequest:
 *       type: object
 *       required: [orderId, itemId, status]
 *       properties:
 *         orderId:
 *           type: string
 *           example: OD175441357273612345
 *         itemId:
 *           type: string
 *           example: "175441357273612345"
 *         status:
 *           type: string
 *           enum: [Dispatched, Shipped, Out for Delivery, Delivered, Cancelled]
 *           example: Shipped
 *     ReviewRequest:
 *       type: object
 *       required: [stars]
 *       properties:
 *         stars:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         text:
 *           type: string
 *           example: Beautiful quality and fast delivery.
 *     ContactRequest:
 *       type: object
 *       required: [name, email, message]
 *       properties:
 *         name:
 *           type: string
 *           example: Aman
 *         email:
 *           type: string
 *           format: email
 *           example: aman@example.com
 *         subject:
 *           type: string
 *           example: Order support
 *         message:
 *           type: string
 *           example: Need help with my order.
 *     ContactResponseRequest:
 *       type: object
 *       properties:
 *         response:
 *           type: string
 *           example: We have resolved your issue.
 *     SellerRegisterRequest:
 *       type: object
 *       required: [sellerName, email, password, phone]
 *       properties:
 *         sellerName:
 *           type: string
 *           example: Demo Seller
 *         email:
 *           type: string
 *           format: email
 *           example: seller@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPass@123
 *         phone:
 *           type: string
 *           example: "9876543210"
 *     SellerProfileUpdateRequest:
 *       type: object
 *       properties:
 *         storeName:
 *           type: string
 *           example: Demo Store
 *         gstNumber:
 *           type: string
 *           example: 22AAAAA0000A1Z5
 *         address:
 *           type: string
 *           example: Noida
 *     SellerProductDetailsRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Updated Product Name
 *         description:
 *           type: string
 *           example: Updated description
 *         category:
 *           type: string
 *           example: Skincare
 *         subcategory:
 *           type: string
 *           example: Serum
 *     SellerProductPricingRequest:
 *       type: object
 *       properties:
 *         price:
 *           type: number
 *           example: 1299
 *         sellingPrice:
 *           type: number
 *           example: 1299
 *         discount:
 *           type: number
 *           example: 10
 *         discountPercentage:
 *           type: number
 *           example: 10
 *         stock:
 *           type: integer
 *           example: 40
 *         inStock:
 *           type: integer
 *           example: 40
 *     SellerPickupRequest:
 *       type: object
 *       required: [orderId, deliveryTaskId]
 *       properties:
 *         orderId:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         deliveryTaskId:
 *           type: string
 *           example: 665f1c1b9f1a9f0012349876
 *     PaymentCreateOrderRequest:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderProductInput'
 *         orderData:
 *           type: object
 *           additionalProperties: true
 *           example:
 *             products:
 *               - product: 665f1c1b9f1a9f0012345678
 *                 quantity: 1
 *             shippingAddress:
 *               fullName: Aman Sharma
 *               phone: "9876543210"
 *               addressLine1: Sector 62
 *               city: Noida
 *               state: UP
 *               postalCode: "201301"
 *               country: India
 *     PaymentVerifyRequest:
 *       type: object
 *       required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *       properties:
 *         razorpay_order_id:
 *           type: string
 *           example: order_xxx
 *         razorpay_payment_id:
 *           type: string
 *           example: pay_xxx
 *         razorpay_signature:
 *           type: string
 *           example: signature_xxx
 *         orderData:
 *           type: object
 *           additionalProperties: true
 *     DeliveryRegisterRequest:
 *       type: object
 *       required: [fullName, email, phone, password, vehicleType]
 *       properties:
 *         fullName:
 *           type: string
 *           example: Ravi Kumar
 *         email:
 *           type: string
 *           format: email
 *           example: ravi.delivery@example.com
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPass@123
 *         vehicleType:
 *           type: string
 *           example: Bike
 *     DeliveryLocationRequest:
 *       type: object
 *       required: [lat, lng]
 *       properties:
 *         lat:
 *           type: number
 *           example: 28.6139
 *         lng:
 *           type: number
 *           example: 77.209
 *     DeliveryTaskActionRequest:
 *       type: object
 *       required: [taskId]
 *       properties:
 *         taskId:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         reason:
 *           type: string
 *           example: Too far
 *     DeliveryStatusRequest:
 *       type: object
 *       required: [taskId, status]
 *       properties:
 *         taskId:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         status:
 *           type: string
 *           example: PickedUp
 *     DeliveryAvailabilityRequest:
 *       type: object
 *       required: [isAvailable]
 *       properties:
 *         isAvailable:
 *           type: boolean
 *           example: true
 *     CreateDeliveryTaskRequest:
 *       type: object
 *       required: [orderId, pickupAddress, dropAddress]
 *       properties:
 *         orderId:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         pickupAddress:
 *           type: string
 *           example: Seller Warehouse
 *         dropAddress:
 *           type: string
 *           example: Buyer Address
 *     AdminLoginRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/LoginRequest'
 *       example:
 *         email: admin@example.com
 *         password: AdminPass@123
 *     ProductBadges:
 *       type: object
 *       additionalProperties: false
 *       description: Admin-controlled marketing badges shown on product cards and merchandising sections.
 *       properties:
 *         bestSeller:
 *           type: boolean
 *           example: true
 *         trending:
 *           type: boolean
 *           example: false
 *         featured:
 *           type: boolean
 *           example: true
 *         newArrival:
 *           type: boolean
 *           example: false
 *         mostPopular:
 *           type: boolean
 *           example: false
 *         topRated:
 *           type: boolean
 *           example: true
 *         onSale:
 *           type: boolean
 *           example: false
 *         limitedStock:
 *           type: boolean
 *           example: false
 *     UpdateProductBadgesRequest:
 *       type: object
 *       required: [badges]
 *       properties:
 *         badges:
 *           allOf:
 *             - $ref: '#/components/schemas/ProductBadges'
 *           minProperties: 1
 *           description: Send one or more badge flags to update. Omitted badge flags are left unchanged.
 *       example:
 *         badges:
 *           trending: true
 *           bestSeller: false
 *     AdminProductSeller:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c1b9f1a9f0012349876
 *         sellerName:
 *           type: string
 *           example: Demo Seller
 *         storeName:
 *           type: string
 *           example: Demo Store
 *         email:
 *           type: string
 *           format: email
 *           example: seller@example.com
 *         phone:
 *           type: string
 *           example: "9876543210"
 *     AdminSeller:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminProductSeller'
 *         - type: object
 *           additionalProperties: true
 *           properties:
 *             verificationStatus:
 *               type: string
 *               enum: [pending, verified, rejected]
 *               description: Seller verification state used by admin seller badges.
 *               example: verified
 *             status:
 *               type: string
 *               enum: [pending, approved, suspended, rejected]
 *               example: approved
 *             isBlocked:
 *               type: boolean
 *               example: false
 *             productCount:
 *               type: integer
 *               description: Count of approved products shown in the admin product-count badge.
 *               example: 12
 *     AdminProductsResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Product'
 *     AdminSellersResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/AdminSeller'
 *     RejectProductRequest:
 *       type: object
 *       properties:
 *         adminNotes:
 *           type: string
 *           example: Product images need better quality.
 *     BlockSellerRequest:
 *       type: object
 *       properties:
 *         isBlocked:
 *           type: boolean
 *           example: true
 *         reason:
 *           type: string
 *           example: Policy violation
 *     RiderStatusRequest:
 *       type: object
 *       required: [isActive]
 *       properties:
 *         isActive:
 *           type: boolean
 *           description: true activates/approves the rider; false deactivates the rider.
 *           example: true
 *     DeliveryRider:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *         name:
 *           type: string
 *           example: Ravi Kumar
 *         email:
 *           type: string
 *           format: email
 *           example: ravi.delivery@example.com
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         currentCity:
 *           type: string
 *           example: Noida
 *         isActive:
 *           type: boolean
 *           example: true
 *     AdminRidersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: integer
 *           example: 4
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DeliveryRider'
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: Hello World!
 * /check:
 *   get:
 *     summary: Basic server check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running.
 * /api/server-status:
 *   get:
 *     summary: Get server uptime
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server uptime returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bootTime:
 *                   type: number
 *                   example: 128.52
 * /sitemap.xml:
 *   get:
 *     summary: Get generated sitemap XML
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Sitemap XML.
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a customer account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * /users/login:
 *   post:
 *     summary: Login a customer
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /users/profile:
 *   get:
 *     summary: Get current customer profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /users/avatar:
 *   put:
 *     summary: Update current customer's avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /users/update-profile:
 *   put:
 *     summary: Update current customer's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /users/forgot-password:
 *   post:
 *     summary: Send customer password reset OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: OTP sent if email exists.
 * /users/verify-otp:
 *   post:
 *     summary: Verify customer password reset OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 * /users/reset-password:
 *   post:
 *     summary: Reset customer password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful.
 */

/**
 * @swagger
 * /users/cart:
 *   get:
 *     summary: Get current customer's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart returned.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Add a product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemRequest'
 *     responses:
 *       200:
 *         description: Product added to cart.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     summary: Clear current customer's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /users/cart/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
 *     responses:
 *       200:
 *         description: Cart item updated.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *     responses:
 *       200:
 *         description: Cart item removed.
 */

/**
 * @swagger
 * /users/favorites:
 *   get:
 *     summary: Get current customer's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites returned.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Add a product to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoriteRequest'
 *     responses:
 *       200:
 *         description: Product added to favorites.
 * /users/favorites/{productId}:
 *   delete:
 *     summary: Remove a product from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: Product removed from favorites.
 */

/**
 * @swagger
 * /users/save-address:
 *   post:
 *     summary: Save legacy user shipping address
 *     tags: [Addresses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressRequest'
 *     responses:
 *       200:
 *         description: Address saved.
 * /users/get-address:
 *   post:
 *     summary: Get legacy user shipping address
 *     tags: [Addresses]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Address returned.
 */

/**
 * @swagger
 * /users/blog:
 *   post:
 *     summary: Create a blog
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Decor trends for 2026
 *               content:
 *                 type: string
 *                 example: Long-form blog content.
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Blog created.
 * /users/blogs:
 *   get:
 *     summary: Get public blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Blog list returned.
 * /users/blogs/{id}:
 *   get:
 *     summary: Get blog by id
 *     tags: [Blogs]
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Blog returned.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List approved products with filters, sorting, and pagination
 *     tags: [Products]
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           example: Home Decor
 *       - name: subcategory
 *         in: query
 *         schema:
 *           type: string
 *           example: Lamps
 *       - name: tag
 *         in: query
 *         schema:
 *           type: string
 *           example: handmade
 *       - name: tags
 *         in: query
 *         schema:
 *           type: string
 *           example: handmade,gift
 *       - name: store
 *         in: query
 *         schema:
 *           type: string
 *           example: Demo Store
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *           example: 500
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *           example: 2000
 *       - name: inStock
 *         in: query
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: minDiscount
 *         in: query
 *         schema:
 *           type: number
 *           example: 10
 *       - name: minRating
 *         in: query
 *         schema:
 *           type: number
 *           example: 4
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating_desc, createdAt_desc, default]
 *           example: price_asc
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           example: 15
 *     responses:
 *       200:
 *         description: Products returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
 * /products/{id}:
 *   get:
 *     summary: Get an approved product by id
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Product returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 * /products/store/{sellerId}:
 *   get:
 *     summary: Get approved products for a seller store
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/SellerId'
 *     responses:
 *       200:
 *         description: Store products returned.
 * /products/shops:
 *   get:
 *     summary: List public shops with product counts and ratings
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Shops returned.
 * /products/navigation/trending-tags:
 *   get:
 *     summary: Get trending product tags
 *     tags: [Products]
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           example: 8
 *     responses:
 *       200:
 *         description: Trending tags returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [handmade, gift, decor]
 * /products/{id}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Reviews returned.
 *   post:
 *     summary: Add a product review with optional photos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ReviewRequest'
 *               - type: object
 *                 properties:
 *                   photos:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: binary
 *     responses:
 *       200:
 *         description: Review added.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /products/{productId}/reviews/{reviewId}/helpful:
 *   post:
 *     summary: Mark a product review as helpful
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *       - name: reviewId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1c1b9f1a9f0012349999
 *     responses:
 *       200:
 *         description: Helpful count updated.
 */

/**
 * @swagger
 * /home/tags:
 *   get:
 *     summary: Get homepage tags
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Tags returned.
 * /home/categories:
 *   get:
 *     summary: Get homepage categories
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Categories returned.
 * /home/products:
 *   get:
 *     summary: Get homepage products
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     responses:
 *       200:
 *         description: Products returned.
 * /home/sellers:
 *   get:
 *     summary: Get homepage sellers
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Sellers returned.
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a COD or non-Razorpay order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   get:
 *     summary: Get all paid/COD orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Orders returned.
 * /api/orders/my-orders:
 *   get:
 *     summary: Get current customer's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's orders returned.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /api/orders/seller/orders:
 *   get:
 *     summary: Get orders for the authenticated seller
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller orders returned.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Get orders by user id
 *     tags: [Orders]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1c1b9f1a9f0012345678
 *     responses:
 *       200:
 *         description: User orders returned.
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a single order by Mongo id or public order id
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200:
 *         description: Order returned.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 * /api/orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel an order owned by the current customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelOrderRequest'
 *     responses:
 *       200:
 *         description: Order cancelled.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /api/orders/eligibility/review/{productId}:
 *   get:
 *     summary: Check whether current customer can review a product
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: Eligibility returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eligible:
 *                   type: boolean
 *                   example: true
 * /api/orders/{orderId}/rating:
 *   post:
 *     summary: Submit an order-level rating with optional photos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ReviewRequest'
 *               - type: object
 *                 properties:
 *                   photos:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: binary
 *     responses:
 *       200:
 *         description: Rating submitted.
 * /api/orders/seller/item-status:
 *   put:
 *     summary: Update a seller-owned order item status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSellerItemStatusRequest'
 *     responses:
 *       200:
 *         description: Item status updated.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: Create Razorpay payment order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreateOrderRequest'
 *     responses:
 *       200:
 *         description: Razorpay order created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   example: order_xxx
 *                 key_id:
 *                   type: string
 *                   example: rzp_test_xxx
 *                 amount:
 *                   type: integer
 *                   example: 149900
 *                 currency:
 *                   type: string
 *                   example: INR
 * /api/payment/verify:
 *   post:
 *     summary: Verify Razorpay payment signature and create or update order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentVerifyRequest'
 *     responses:
 *       201:
 *         description: Payment verified and order returned.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 * /api/payment/webhook:
 *   post:
 *     summary: Razorpay webhook endpoint
 *     tags: [Payment]
 *     parameters:
 *       - name: x-razorpay-signature
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *           example: webhook_signature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             example:
 *               event: payment.captured
 *               payload:
 *                 payment:
 *                   entity:
 *                     id: pay_xxx
 *                     order_id: order_xxx
 *     responses:
 *       200:
 *         description: Webhook accepted.
 *       400:
 *         description: Missing or invalid webhook signature.
 */

/**
 * @swagger
 * /api/document:
 *   get:
 *     summary: Document route health check
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Document route is reachable.
 * /api/document/invoice/{orderId}:
 *   get:
 *     summary: Download order invoice PDF
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200:
 *         description: Invoice PDF.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 * /api/document/label/{orderId}:
 *   get:
 *     summary: Download order shipping label PDF
 *     tags: [Documents]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200:
 *         description: Shipping label PDF.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get current customer's address book
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses returned.
 *   post:
 *     summary: Create an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressRequest'
 *     responses:
 *       201:
 *         description: Address created.
 * /api/addresses/{addressId}:
 *   get:
 *     summary: Get an address by id
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AddressId'
 *     responses:
 *       200:
 *         description: Address returned.
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AddressId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressRequest'
 *     responses:
 *       200:
 *         description: Address updated.
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AddressId'
 *     responses:
 *       200:
 *         description: Address deleted.
 * /api/addresses/{addressId}/default:
 *   patch:
 *     summary: Set an address as default
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AddressId'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {}
 *     responses:
 *       200:
 *         description: Default address updated.
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       201:
 *         description: Contact message created.
 *   get:
 *     summary: Get contact messages
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: Contact messages returned.
 * /api/contact/{id}:
 *   put:
 *     summary: Respond to a contact message
 *     tags: [Contact]
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactResponseRequest'
 *     responses:
 *       200:
 *         description: Contact response saved.
 *   delete:
 *     summary: Delete a contact message
 *     tags: [Contact]
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Contact message deleted.
 * /api/contact-us:
 *   post:
 *     summary: Submit contact-us form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       201:
 *         description: Contact-us message created.
 */

/**
 * @swagger
 * /api/seller/register:
 *   post:
 *     summary: Register seller account and send OTP
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellerRegisterRequest'
 *     responses:
 *       201:
 *         description: Seller registered.
 * /api/seller/verify-otp:
 *   post:
 *     summary: Verify seller registration OTP
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellerVerifyOtpRequest'
 *     responses:
 *       200:
 *         description: Seller OTP verified.
 * /api/seller/resent-otp:
 *   post:
 *     summary: Resend seller registration OTP
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Seller OTP resent.
 * /api/seller/login:
 *   post:
 *     summary: Login seller
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Seller login successful.
 * /api/seller/profile:
 *   get:
 *     summary: Get authenticated seller profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile returned.
 *   put:
 *     summary: Update seller profile with optional verification files
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/SellerProfileUpdateRequest'
 *               - type: object
 *                 properties:
 *                   aadharFile:
 *                     type: string
 *                     format: binary
 *                   panFile:
 *                     type: string
 *                     format: binary
 *     responses:
 *       200:
 *         description: Seller profile updated.
 * /api/seller/onboarding:
 *   post:
 *     summary: Complete seller onboarding with verification files
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/SellerProfileUpdateRequest'
 *               - type: object
 *                 required: [aadharFile, panFile]
 *                 properties:
 *                   aadharFile:
 *                     type: string
 *                     format: binary
 *                   panFile:
 *                     type: string
 *                     format: binary
 *     responses:
 *       200:
 *         description: Seller onboarding completed.
 * /api/seller/products:
 *   get:
 *     summary: Get products owned by authenticated seller
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller products returned.
 * /api/seller/forgot-password:
 *   post:
 *     summary: Send seller password reset OTP
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: OTP sent if email exists.
 * /api/seller/verify-password-otp:
 *   post:
 *     summary: Verify seller password reset OTP
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified.
 * /api/seller/reset-password:
 *   post:
 *     summary: Reset seller password
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful.
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a seller product with images
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, category, subcategory, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Handmade Ceramic Lamp
 *               description:
 *                 type: string
 *                 example: A handcrafted lamp for home decor.
 *               category:
 *                 type: string
 *                 example: Home Decor
 *               subcategory:
 *                 type: string
 *                 example: Lamps
 *               price:
 *                 type: number
 *                 example: 1299
 *               stock:
 *                 type: integer
 *                 example: 40
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /api/productinfo/my:
 *   get:
 *     summary: List approved product info records for authenticated seller
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           example: Skincare
 *       - name: subcategory
 *         in: query
 *         schema:
 *           type: string
 *           example: Serum
 *       - name: minprice
 *         in: query
 *         schema:
 *           type: number
 *           example: 500
 *       - name: maxprice
 *         in: query
 *         schema:
 *           type: number
 *           example: 2500
 *       - name: instock
 *         in: query
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: minrating
 *         in: query
 *         schema:
 *           type: number
 *           example: 4
 *       - name: tag
 *         in: query
 *         schema:
 *           type: string
 *           example: handmade,gift
 *       - name: view
 *         in: query
 *         schema:
 *           type: string
 *           enum: [active, deleted, all]
 *           example: active
 *     responses:
 *       200:
 *         description: Seller product info returned.
 * /api/productinfo/{id}:
 *   get:
 *     summary: Get seller product info by id
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Product info returned.
 *   delete:
 *     summary: Delete seller product
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Product deleted.
 * /api/productinfo/{id}/details:
 *   patch:
 *     summary: Update seller product details
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellerProductDetailsRequest'
 *     responses:
 *       200:
 *         description: Product details updated.
 * /api/productinfo/{id}/pricing:
 *   patch:
 *     summary: Update seller product pricing and stock
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellerProductPricingRequest'
 *     responses:
 *       200:
 *         description: Product pricing updated.
 * /api/categories:
 *   get:
 *     summary: Get all seller product categories
 *     tags: [Seller]
 *     responses:
 *       200:
 *         description: Categories returned.
 * /api/categories/{categoryName}/subcategories:
 *   get:
 *     summary: Get subcategories for a category
 *     tags: [Seller]
 *     parameters:
 *       - name: categoryName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: Skincare
 *     responses:
 *       200:
 *         description: Subcategories returned.
 * /api/dashboard/stats/{sellerId}:
 *   get:
 *     summary: Get seller dashboard stats
 *     tags: [Seller]
 *     parameters:
 *       - $ref: '#/components/parameters/SellerId'
 *     responses:
 *       200:
 *         description: Dashboard stats returned.
 * /api/dashboard/orders/{sellerId}:
 *   get:
 *     summary: Get seller dashboard orders
 *     tags: [Seller]
 *     parameters:
 *       - $ref: '#/components/parameters/SellerId'
 *     responses:
 *       200:
 *         description: Dashboard orders returned.
 * /api/stats/overview:
 *   get:
 *     summary: Get seller overview stats
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview stats returned.
 * /api/stats/sales-graph:
 *   get:
 *     summary: Get seller sales graph stats
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales graph returned.
 * /api/stats/order-status:
 *   get:
 *     summary: Get seller order status stats
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order status stats returned.
 * /api/stats/category-stats:
 *   get:
 *     summary: Get seller category stats
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category stats returned.
 * /api/stats/inventory:
 *   get:
 *     summary: Get seller inventory stats
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory stats returned.
 * /api/stats/inventory-management:
 *   get:
 *     summary: Get seller inventory management stats
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory management data returned.
 * /api/seller/delivery/active-deliveries:
 *   get:
 *     summary: Get active deliveries for seller
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active deliveries returned.
 * /api/seller/delivery/markAsPickedUp:
 *   put:
 *     summary: Mark seller delivery task as picked up
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellerPickupRequest'
 *     responses:
 *       200:
 *         description: Delivery marked as picked up.
 */

/**
 * @swagger
 * /api/delivery/register:
 *   post:
 *     summary: Register a delivery partner
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryRegisterRequest'
 *     responses:
 *       201:
 *         description: Delivery partner registered.
 * /api/delivery/login:
 *   post:
 *     summary: Login delivery partner
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful.
 * /api/delivery/verify:
 *   get:
 *     summary: Verify delivery partner token
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid.
 * /api/delivery/orders:
 *   get:
 *     summary: Get delivery partner tasks
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks returned.
 * /api/delivery/tasks/{taskId}:
 *   get:
 *     summary: Get delivery task by id
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskId'
 *     responses:
 *       200:
 *         description: Task returned.
 * /api/delivery/nearby-Deliveries:
 *   get:
 *     summary: Get nearby delivery tasks
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nearby deliveries returned.
 * /api/delivery/me:
 *   get:
 *     summary: Get delivery partner profile
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile returned.
 * /api/delivery/update-location:
 *   put:
 *     summary: Update delivery partner location
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryLocationRequest'
 *     responses:
 *       200:
 *         description: Location updated.
 * /api/delivery/accept-task:
 *   post:
 *     summary: Accept delivery task
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryTaskActionRequest'
 *     responses:
 *       200:
 *         description: Task accepted.
 * /api/delivery/task-status:
 *   put:
 *     summary: Update delivery task status
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryStatusRequest'
 *     responses:
 *       200:
 *         description: Task status updated.
 * /api/delivery/active-deliveries:
 *   get:
 *     summary: Get active delivery task for current partner
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active delivery returned.
 * /api/delivery/cancel-task:
 *   put:
 *     summary: Cancel accepted delivery task
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryTaskActionRequest'
 *     responses:
 *       200:
 *         description: Task cancelled.
 * /api/delivery/reject-task:
 *   post:
 *     summary: Reject delivery task
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryTaskActionRequest'
 *     responses:
 *       200:
 *         description: Task rejected.
 * /api/delivery/availability:
 *   put:
 *     summary: Update delivery partner availability
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryAvailabilityRequest'
 *     responses:
 *       200:
 *         description: Availability updated.
 * /api/deliverytask/create:
 *   post:
 *     summary: Create a delivery task for an order
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeliveryTaskRequest'
 *     responses:
 *       201:
 *         description: Delivery task created.
 * /api/deliverytask/task/{deliveryTaskId}/accept:
 *   post:
 *     summary: Accept delivery task request by id
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeliveryTaskId'
 *     responses:
 *       200:
 *         description: Delivery task accepted.
 * /api/deliverytask/task/{deliveryTaskId}/reject:
 *   post:
 *     summary: Reject delivery task request by id
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeliveryTaskId'
 *     responses:
 *       200:
 *         description: Delivery task rejected.
 * /api/deliverytask/sendRequest/{deliveryTaskId}:
 *   post:
 *     summary: Send delivery request for a delivery task
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeliveryTaskId'
 *     responses:
 *       200:
 *         description: Delivery request sent.
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Admin login successful.
 * /api/admin/verify:
 *   get:
 *     summary: Verify admin token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid.
 * /api/admin/products:
 *   get:
 *     summary: Get products by admin moderation status
 *     description: Returns products for the admin status badges/tabs. Defaults to pending when status is omitted.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         description: Product moderation badge state to fetch.
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *           example: pending
 *     responses:
 *       200:
 *         description: Products returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProductsResponse'
 * /api/admin/products/{productId}/approve:
 *   put:
 *     summary: Approve a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: Product approved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 * /api/admin/products/{productId}/reject:
 *   put:
 *     summary: Reject a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectProductRequest'
 *     responses:
 *       200:
 *         description: Product rejected.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 * /api/admin/products/{productId}/badges:
 *   put:
 *     summary: Update admin product marketing badges
 *     description: Toggles one or more product marketing badges such as Bestseller, Trending, Featured, New Arrival, Most Popular, Top Rated, On Sale, and Limited Stock. Omitted badge flags are not changed.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductBadgesRequest'
 *           examples:
 *             markTrending:
 *               summary: Mark product as trending
 *               value:
 *                 badges:
 *                   trending: true
 *             updateMultipleBadges:
 *               summary: Update multiple badge flags
 *               value:
 *                 badges:
 *                   bestSeller: true
 *                   featured: true
 *                   limitedStock: false
 *     responses:
 *       200:
 *         description: Product badges updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 * /api/admin/products/{productId}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: Product deleted.
 * /api/admin/sellers:
 *   get:
 *     summary: Get all sellers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sellers returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSellersResponse'
 * /api/admin/sellers/{sellerId}:
 *   get:
 *     summary: Get seller by id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SellerId'
 *     responses:
 *       200:
 *         description: Seller returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSeller'
 *   delete:
 *     summary: Delete seller by id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SellerId'
 *     responses:
 *       200:
 *         description: Seller deleted.
 * /api/admin/sellers/{sellerId}/products:
 *   get:
 *     summary: Get products for a seller
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SellerId'
 *     responses:
 *       200:
 *         description: Seller products returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProductsResponse'
 * /api/admin/sellers/{sellerId}/block:
 *   put:
 *     summary: Block or unblock a seller
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SellerId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockSellerRequest'
 *     responses:
 *       200:
 *         description: Seller block state updated.
 * /api/admin/analytics/sales:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales analytics returned.
 * /api/admin/analytics/users:
 *   get:
 *     summary: Get user analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics returned.
 * /api/admin/analytics/weekly-active-users:
 *   get:
 *     summary: Get weekly active user analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly active users returned.
 * /api/admin/stats/category-stats:
 *   get:
 *     summary: Get admin category stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category stats returned.
 * /api/admin/riders/pending:
 *   get:
 *     summary: Get pending delivery riders
 *     description: Returns inactive riders for the admin riders pending badge/tab.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Pending riders returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminRidersResponse'
 * /api/admin/riders/active:
 *   get:
 *     summary: Get active delivery riders
 *     description: Returns active riders for the admin riders active badge/tab.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Active riders returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminRidersResponse'
 * /api/admin/riders/{id}/status:
 *   patch:
 *     summary: Update delivery rider approval status
 *     tags: [Admin]
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RiderStatusRequest'
 *     responses:
 *       200:
 *         description: Rider status updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Rider activated sucessfully
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications returned.
 *   delete:
 *     summary: Delete all notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications deleted.
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked read.
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationId'
 *     responses:
 *       200:
 *         description: Notification marked read.
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationId'
 *     responses:
 *       200:
 *         description: Notification deleted.
 */

/**
 * @swagger
 * /api/subscribe:
 *   post:
 *     summary: Subscribe to the newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       201:
 *         description: Subscribed Successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Subscribed Successfully
 *       400:
 *         description: Email is required or Email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Email already exists
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
