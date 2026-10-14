# Aestheticommerce

A multi-vendor marketplace for handmade art and crafts, built for India (INR pricing, GST, Razorpay, Aadhaar/PAN seller KYC, 6-digit pincodes). Products are organised by category (Visual Arts, Paper Crafts, Traditional & Cultural Crafts, Sculptural & 3D, Textile Arts, Decorative Arts) and by occasion (Diwali, Eid, Christmas, birthdays, housewarming).

The project is one Node.js/Express API and four React apps, one for each kind of user.

| App | Folder | Who uses it | What it does |
|---|---|---|---|
| Storefront | `FrontEnd/` | Customers | Browse and filter products, cart, wishlist, coupons, checkout with Razorpay or cash on delivery, order tracking, reviews, invoice download |
| Seller panel | `Seller-Panel/` | Sellers | Email OTP signup, KYC onboarding, product listing with images and video, pricing, orders, delivery requests, sales stats |
| Admin panel | `Admin-Panel/` | Admins | Approve or reject products, award badges, manage sellers and riders, banners, analytics |
| Delivery dashboard | `delivery-dashboard/` | Delivery riders | Registration with admin approval, real-time delivery requests over Socket.io, status updates that flow back to the order |
| API | `Backend/` | All apps | REST API with Swagger docs at `/api-docs` |

## Tech stack

- **Backend:** Node.js, Express, MongoDB with Mongoose, JWT auth, Socket.io, Razorpay, AWS S3 + CloudFront for media, Resend and Nodemailer for email, PDFKit for invoices, node-cron, Zod and express-validator
- **Frontends:** React with Vite, Redux Toolkit, React Router, Material UI, Tailwind CSS, Axios; charts with Recharts (admin) and Nivo (seller)

## Running locally

You need Node.js and MongoDB. Rider task acceptance and status updates use MongoDB transactions, so MongoDB must run as a replica set (a single-node replica set is enough).

### 1. Backend

```bash
cd Backend
npm install
cp env.example .env   # then fill in the values
npm start
```

Variables the backend reads:

| Variable | Purpose |
|---|---|
| `PORT`, `NODE_ENV` | Server settings |
| `DB_CONNECT` | MongoDB connection string |
| `JWT_SECRET` | Signs login tokens |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Online payments |
| `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` | Transactional email |
| `EMAIL`, `MAIL_PASS`, `SMTP_USER`, `SMTP_PASS` | Gmail accounts for seller and newsletter mail |
| `S3_REGION`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDFRONT_URL` | Image and video uploads |

The Razorpay and Resend clients are created when the server starts, so `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RESEND_API_KEY` must be set (placeholder values are fine if you don't need payments or email).

### 2. Frontends

Each app is started the same way:

```bash
cd FrontEnd            # or Seller-Panel, Admin-Panel, delivery-dashboard
npm install
npm run dev
```

Create a `.env` in each app folder:

| App | Variables |
|---|---|
| `FrontEnd` | `VITE_API_URL`, `VITE_APP_URL`, `VITE_SELLER_API_URL` |
| `Seller-Panel` | `VITE_API_URL`, `VITE_APP_URL` |
| `Admin-Panel` | `VITE_API_URL` |
| `delivery-dashboard` | `VITE_API_URL` |

`VITE_API_URL` is the backend's address, for example `http://localhost:5000`.
