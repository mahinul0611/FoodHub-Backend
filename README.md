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
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register as Customer/Provider |
| POST | `/api/auth/sign-in/email` | Login for all roles |
| GET  | `/me` | Get currently logged-in user info |

### 🍱 Meals & Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/meals` | Get all meals (Query: `searchTerm`, `minPrice`) |
| GET    | `/meals/:id` | Get single meal details |
| POST   | `/meals` | Create a new meal (Provider only) |
| PUT    | `/meals/:id` | Update meal details |
| DELETE | `/meals/:id` | Remove a meal |
| GET    | `/admin/category` | Get all food categories |
| POST   | `/admin/category` | Create new category (Admin only) |

### 🛒 Orders & Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/orders` | Create a new order (Customer) |
| GET    | `/orders` | Get customer's order history |
| PATCH  | `/provider/orders/:id` | Update order status (Provider) |
| POST   | `/reviews` | Submit a meal review |

### 🛡️ Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/admin/stats` | Platform usage statistics |
| GET    | `/admin/users` | List all registered users |
| GET    | `/admin/users/:id` | View specific user details |
| PUT    | `/admin/users/:id` | Update user status (ACTIVATE/SUSPEND) |

## ⚙️ Setup & Usage Instructions

### 1️⃣ **Clone the Repository**
```bash
git clone [https://github.com/mahinul0611/foodhub-backend](https://github.com/mahinul0611/foodhub-backend)
cd foodhub-backend
```

### 2️⃣ **Install Dependencies**

```
npm install
```

### 3️⃣ **Environment Variables**

```
CONNECTION_STR= "Your database connection String"
PORT=5000

DATABASE_URL="your_database_url"


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
