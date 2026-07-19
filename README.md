# 🍱 FoodHub Management System (Backend)

FoodHub is a comprehensive full-stack backend solution for a multi-vendor meal ordering platform. It enables customers to discover and order meals, providers to manage their menus, and admins to oversee the entire ecosystem with role-based security.

Built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, and **BetterAuth**.

---

## 🌐 Live Deployment

🔗 **API Base URL:** [https://foodhub-backend-5.onrender.com/](https://foodhub-backend-5.onrender.com/)  
🔗 **Local Development:** `http://localhost:5000`

---

## 🎯 Features

### 👤 **User Management & Auth**
- **Multi-Role Support:** Separate registration and login for `Customer`, `Provider`, and `Admin`.
- **Secure Access:** JWT-based authentication with role-based middleware to protect private routes.
- **Profile Control:** Users can view their own info (`/me`) and Providers can update their business profiles.

### 🥗 **Meal & Category Management**
- **Cuisine Categories:** Admin managed food categories (e.g., Kacchi, Pasta, Biriyani).
- **Provider Menu:** Providers can Create, Update, and Delete meals in their menu.
- **Advanced Discovery:** Search meals by name or filter by price range (`minPrice`).

### 🛒 **Ordering & Review System**
- **Seamless Ordering:** Customers can place orders with multiple items and delivery details.
- **Status Tracking:** Real-time order status updates (e.g., `PLACED` ➔ `PREPARING` ➔ `READY` ➔ `DELIVERED`).
- **Feedback Loop:** Customers can leave ratings and comments on meals they have ordered.

### 🛡️ **Admin Moderation**
- **System Stats:** Dashboard for viewing total users, orders, and platform growth.
- **User Control:** Manage all registered users and activate/suspend accounts as needed.
- **Order Oversight:** Access and monitor every order placed on the platform.

---

## 🛠️ Technology Stack

| Layer          | Technology             |
| -------------- | ---------------------- |
| **Language** | TypeScript             |
| **Runtime** | Node.js                |
| **Framework** | Express.js             |
| **Database** | PostgreSQL             |
| **ORM** | Prisma            |
| **Auth** | BetterAuth                    |
| **Deployment** | Vercel                 |

---

## 🚀 API Endpoints

### 🔑 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register new Customer or Provider |
| POST | `/api/auth/sign-in/email` | Login for all roles (Customer/Provider/Admin) |
| GET  | `/me` | Get currently logged-in user profile |

### 🍱 Meals & Categories (Public & Provider)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/meals` | Get all meals with filters (`searchTerm`, `minPrice`) |
| GET    | `/meals/:id` | Get specific meal details |
| POST   | `/meals` | Create a new meal (Provider only) |
| PUT    | `/meals/:id` | Update meal info (Provider only) |
| DELETE | `/meals/:id` | Delete a meal from menu |
| GET    | `/admin/category` | View all available categories |

### 🛒 Orders & Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/orders` | Create a new order (Customer) |
| GET    | `/orders` | Get current customer's order history |
| PATCH  | `/provider/orders/:id` | Update order status (Provider only) |
| POST   | `/reviews` | Submit a rating and review for a meal |

### 🛡️ Admin Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/admin/stats` | View platform-wide statistics |
| GET    | `/admin/users` | List all users on the platform |
| PUT    | `/admin/users/:id` | Update user status (ACTIVATE/SUSPEND) |
| POST   | `/admin/category` | Create a new category |

---

## ⚙️ Setup & Usage Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/mahinul0611/foodhub-backend
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
