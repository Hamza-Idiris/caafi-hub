# 🌊 Caafi Water Operations — Backend API

B2B Water Supply & Fleet Management System for Mogadishu market.
Built with **Node.js · Express.js · MongoDB · Mongoose · JWT**.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Seed database (creates users, shops, sample orders)
npm run seed

# 4. Start dev server
npm run dev
```

---

## Project Structure

```
caafi-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Login + shop registration
│   ├── adminController.js     # Full system CRUD + stats
│   ├── staffController.js     # Order review + customer CRM
│   ├── driverController.js    # Delivery management
│   ├── shopController.js      # Shop self-service profile
│   └── orderController.js     # Full order lifecycle
├── middleware/
│   ├── authMiddleware.js      # JWT verify + role guard
│   ├── errorHandler.js        # Global error handler
│   └── validate.js            # express-validator middleware
├── models/
│   ├── User.js                # Admin | Staff | Driver
│   ├── Shop.js                # B2B client shops
│   └── Order.js               # Orders with status log
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── staffRoutes.js
│   ├── driverRoutes.js
│   ├── shopRoutes.js
│   └── orderRoutes.js
├── seed/
│   └── seeder.js              # Initial data seeder
├── utils/
│   ├── apiResponse.js         # Standardised JSON helpers
│   └── generateToken.js       # JWT generator
├── .env.example
├── .gitignore
├── package.json
└── server.js                  # Entry point
```

---

## API Reference

> All protected endpoints require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint                    | Access  | Description                   |
|--------|-----------------------------|---------|-------------------------------|
| POST   | `/api/auth/system/login`    | Public  | Login for Admin / Staff / Driver |
| POST   | `/api/auth/shop/register`   | Public  | New shop self-registration    |
| POST   | `/api/auth/shop/login`      | Public  | Shop login via phone + PIN    |
| GET    | `/api/auth/me`              | All     | Get current user/shop profile |

### Orders

| Method | Endpoint                    | Access         | Description                     |
|--------|-----------------------------|----------------|---------------------------------|
| POST   | `/api/orders`               | Shop           | Place a new order (min 10 barrels) |
| GET    | `/api/orders/my-orders`     | Shop           | View own order history          |
| GET    | `/api/orders`               | Admin, Staff   | Get all orders (`?status=`)     |
| GET    | `/api/orders/:id`           | Admin, Staff   | Get single order                |
| PATCH  | `/api/orders/:id/review`    | Admin, Staff   | Approve or reject pending order |
| PATCH  | `/api/orders/:id/dispatch`  | Admin          | Assign order to a driver        |
| PATCH  | `/api/orders/:id/deliver`   | Driver         | Update delivery status          |
| DELETE | `/api/orders/:id`           | Admin          | Delete an order                 |

### Driver

| Method | Endpoint                         | Access | Description              |
|--------|----------------------------------|--------|--------------------------|
| GET    | `/api/driver/deliveries`         | Driver | Get assigned deliveries  |
| GET    | `/api/driver/deliveries/:id`     | Driver | Single delivery detail   |
| PATCH  | `/api/driver/deliveries/:id/status` | Driver | Mark On The Way / Delivered |
| GET    | `/api/driver/stats`              | Driver | Personal delivery stats  |

### Staff (CRM)

| Method | Endpoint               | Access         | Description              |
|--------|------------------------|----------------|--------------------------|
| GET    | `/api/staff/summary`   | Admin, Staff   | Dashboard counts         |
| GET    | `/api/staff/shops`     | Admin, Staff   | List all client shops    |
| GET    | `/api/staff/shops/:id` | Admin, Staff   | Shop detail + orders     |
| PUT    | `/api/staff/shops/:id` | Admin, Staff   | Update shop contact info |

### Admin

| Method | Endpoint                       | Access | Description             |
|--------|--------------------------------|--------|-------------------------|
| GET    | `/api/admin/stats`             | Admin  | System-wide dashboard   |
| GET    | `/api/admin/users`             | Admin  | All staff + drivers     |
| POST   | `/api/admin/users`             | Admin  | Create new user         |
| GET    | `/api/admin/users/:id`         | Admin  | Get user                |
| PUT    | `/api/admin/users/:id`         | Admin  | Update user             |
| DELETE | `/api/admin/users/:id`         | Admin  | Delete user             |
| PATCH  | `/api/admin/users/:id/toggle`  | Admin  | Activate / deactivate   |
| GET    | `/api/admin/shops`             | Admin  | All registered shops    |
| DELETE | `/api/admin/shops/:id`         | Admin  | Delete shop             |
| PATCH  | `/api/admin/shops/:id/toggle`  | Admin  | Activate / deactivate shop |

### Shop Self-Service

| Method | Endpoint           | Access | Description          |
|--------|--------------------|--------|----------------------|
| GET    | `/api/shops/profile` | Shop | Get own profile      |
| PUT    | `/api/shops/profile` | Shop | Update own profile   |

---

## Order Status Flow

```
Pending ──► Approved ──► Dispatched ──► On The Way ──► Delivered
               │
               └──► Rejected
```

| Status       | Who changes it |
|--------------|----------------|
| Pending      | Created by Shop |
| Approved     | Staff / Admin   |
| Rejected     | Staff / Admin   |
| Dispatched   | Admin           |
| On The Way   | Driver          |
| Delivered    | Driver          |

---

## Seeded Credentials

**System Accounts**

| Role   | Username | Password     |
|--------|----------|--------------|
| Admin  | admin    | Admin@caafi1 |
| Staff  | staff1   | Staff@123    |
| Staff  | staff2   | Staff@456    |
| Driver | driver1  | Driver@123   |
| Driver | driver2  | Driver@456   |

**Shop Accounts (phone / PIN)**

| Shop Name        | Phone          | PIN  |
|------------------|----------------|------|
| Al-Baraka Store  | 252615001234   | 1234 |
| Nuur Grocery     | 252617002345   | 2345 |
| Salaam Mart      | 252618003456   | 3456 |
