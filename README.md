# 🍱 FoodHub Management System (Backend)

A complete backend API for managing meal ordering, provider menus, user roles, and order processing.
Built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**,**Prisma** and **Better Auth Authentication**.

---

## 🌐 Live Deployment

🔗 **API Base URL:** https://foodhub-backend-sigma.vercel.app/

---

## 🎯 Features

### 👤 **User Management**

- User registration & login with role selection (customer, provider)
- Session-based authentication
- Role-based access control (RBAC) for Admin, Provider, and Customer
- Profile management and user status tracking

### 🥗 ** Meal & Menu Management**

- Providers can add, update, and remove menu items
- Browse meals with filters (cuisine, dietary preferences, price)
- Category-based meal organization
- Auto data normalization for prices and quantities

### 🛒 **Ordering & Review System**

- Customers can place orders with delivery details (COD)
- Real-time order status tracking (PLACED ➔ PREPARING ➔ READY ➔ DELIVERED)
- Updates vehicle status automatically
- Validation for meal availability during checkout
- Post-delivery review and rating system for meals

### 🛡️ **Admin Controls**

- Comprehensive dashboard with system statistics (stats)
- Manage all users (activate/suspend accounts)
- Platform-wide order oversight and category management

---

## 🛠️ Technology Stack

| Layer          | Technology |
| -------------- | ---------- |
| Language       | TypeScript |
| Runtime        | Node.js    |
| Framework      | Express.js |
| Database       | PostgreSQL |
| Auth           | BetterAuth |
| ORM / Querying | Prisma     |
| Deployment     | Vercel     |

---

## 🚀 API Endpoints

### 🔑 Authentication

| Method | Endpoint                  | Permission | Description            |
| ------ | ------------------------- | ---------- | ---------------------- |
| POST   | `/api/auth/sign-up/email` | Public     | Register a new user    |
| POST   | `/api/auth/sign-in/email` | Public     | Login user & get token |

### 🍱 Meals & Reviews (Public/Customer)

| Method | Endpoint     | Permission | Description                |
| ------ | ------------ | ---------- | -------------------------- |
| POST   | `/meals`     | Provider   | Create Meals               |
| GET    | `/meals`     | Public     | Get all meals with filters |
| GET    | `/meals/:id` | Public     | Get specific meal details  |
| GET    | `/reviews`   | Public     | View meal reviews          |

### 👨‍🍳 Provider & Orders

| Method | Endpoint | Permission | Description |
| ------ | ------------------------- | ---------- | ---------------------- |
|GET| `/orders` | Customer |View user-specific orders|
| GET | /provider/orders | Provider | View incoming orders for provider|
| PATCH| /orders/:id | Provider Update order status|

### 🛡️ Admin Management

| Method | Endpoint | Permission | Description |
| ------ | ------------------------- | ---------- | ---------------------- |
|GET |`/admin/stats`|ADMIN |View system-wide statistics|
|GET |`/admin/users`|ADMIN |View all registered users|
|GET |`/admin/users/:id`|ADMIN |Get specific user details|
|GET| `/admin/category`| ADMIN|Manage food categories|

## Setup & Usage Instructions

### 1️⃣ **Clone the Repository**

```bash
git clone "https://github.com/mahinul0611/FoodHub-Backend"
cd FoodHub-Backend
```

### 2️⃣ **Install Dependencies**

```
npm install
```

### 3️⃣ **Environment Variables**

```
CONNECTION_STR= "Your database connection String"
PORT=5000

DATABASE_URL="postgresql://neondb_owner:npg_3OWCBauZeky2@ep-lively-wave-ahuv90ug-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require&connection_limit=10&pool_timeout=20"


BETTER_AUTH_SECRET="your secret"

BETTER_AUTH_URL=http://localhost:5000 # Backend URL of your app


APP_URL = http://localhost:3000  #Frontend URL

APP_USER="Your app user"

APP_PASSWORD="your app password"


GOOGLE_CLIENT_ID="Your client id"

GOOGLE_CLIENT_SECRET="Your client secret"


FACEBOOK_CLIENT_ID="Your client id"
FACEBOOK_CLIENT_SECRET="Your client secret"


```

### 4️⃣ **Run the Server**

```
npm run dev
```

### 5️⃣ **API Base URL**

```
http://localhost:5000/
```

---

## 📦 GitHub Repository

🔗 https://github.com/mahinul0611/FoodHub-Backend

---

## 🌐 Live Deployment

🔗 https://foodhub-backend-sigma.vercel.app
