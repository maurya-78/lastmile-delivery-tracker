# 🚚 LastMile Delivery Tracker

A full-stack logistics and delivery management platform that automates delivery pricing, intelligent agent assignment, live tracking, and customer notifications.

> Developed as a Hackathon Project using the MERN Stack.

---

# 🌐 Live Demo

### Frontend (Production)

**Custom Domain**

https://lastmile-delivery-tracker-sooty.vercel.app

**Vercel Deployment**

https://lastmile-delivery-tracker-j9xu3sxad.vercel.app

### Backend API

https://lastmile-backend-ib38.onrender.com

---

# 📌 Problem Statement

Logistics companies require an efficient delivery management system capable of:

- Automatic delivery charge calculation
- Zone based pricing
- Intelligent delivery agent assignment
- Real-time shipment tracking
- Failed delivery management
- Email notifications
- Complete delivery history

This project implements all these requirements in a modern web application.

---

# ✨ Features

## 👤 Customer

- User Registration & Login
- Place Delivery Orders
- Live Delivery Charge Estimation
- View Order History
- Track Orders
- View Tracking Timeline
- Reschedule Failed Deliveries
- Email Notifications
- Profile Management

---

## 🚴 Delivery Agent

- Secure Login
- View Assigned Orders
- Update Delivery Status
- Toggle Availability
- View Assigned Zones
- Manage Profile

---

## 👨‍💼 Admin

- Dashboard Analytics
- Customer Management
- Agent Management
- Zone Management
- Rate Card Management
- Create Orders
- View All Orders
- Manual Agent Assignment
- Auto Agent Assignment
- Override Order Status

---

# ⚙️ Rate Calculation Engine

The pricing engine automatically calculates delivery charges.

## Step 1

Detect Pickup Zone

↓

Detect Drop Zone

---

## Step 2

Calculate Volumetric Weight

```
Volumetric Weight =
Length × Breadth × Height
--------------------------
          5000
```

---

## Step 3

Billing Weight

```
Billing Weight =
Max(Actual Weight,
Volumetric Weight)
```

---

## Step 4

Detect

- Intra Zone
- Inter Zone

---

## Step 5

Apply Correct Rate Card

Depending on

- B2B
- B2C

---

## Step 6

Apply COD Surcharge

(if payment type is COD)

---

## Step 7

Calculate Final Charge

```
Total Charge

=

Base Charge

+

Weight Charge

+

COD Surcharge
```

---

# 📍 Zone Detection

Each Zone contains multiple serviceable pincodes.

The system automatically

- detects pickup zone
- detects drop zone
- identifies intra/inter zone
- applies correct pricing

No hardcoded pricing is used.

---

# 🚴 Intelligent Agent Assignment

Priority 1

Available agent currently inside pickup zone.

↓

Priority 2

Available agent assigned to pickup zone.

↓

Priority 3

Any available delivery agent.

---

# 📦 Order Lifecycle

```
Order Placed

↓

Confirmed

↓

Agent Assigned

↓

Picked Up

↓

In Transit

↓

Out For Delivery

↓

Delivered
```

---

## Failed Delivery Flow

```
Failed

↓

Customer Notification

↓

Customer Reschedules

↓

Agent Reassigned

↓

Out For Delivery

↓

Delivered
```

---

# 📜 Immutable Tracking History

Every order status update creates a permanent tracking event.

Each event stores

- Status
- Timestamp
- Actor Name
- Actor Role
- Notes

History cannot be modified or deleted.

---

# 📧 Email Notifications

Automatic emails are sent for

- Order Placed
- Confirmed
- Agent Assigned
- Picked Up
- In Transit
- Out For Delivery
- Delivered
- Failed
- Rescheduled
- Cancelled

---

# 🔐 Authentication

JWT Authentication

Role Based Authorization

Supported Roles

- Customer
- Delivery Agent
- Admin

Passwords are encrypted using **bcrypt**.

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- React Icons
- React Hot Toast

---

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Nodemailer

---

## Deployment

Frontend

- Vercel

Backend

- Render

Database

- MongoDB Atlas

---

# 📁 Project Structure

```
Lastmile/

│

├── Backend

│ ├── src

│ │ ├── config

│ │ ├── controllers

│ │ ├── middleware

│ │ ├── models

│ │ ├── routes

│ │ ├── services

│ │ └── server.js

│

├── Frontend

│ ├── src

│ │ ├── assets

│ │ ├── components

│ │ ├── context

│ │ ├── pages

│ │ │ ├── admin

│ │ │ ├── customer

│ │ │ └── agent

│ │ ├── services

│ │ └── utils

│

└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/maurya-78/lastmile-delivery-tracker.git
```

---

## Backend

```bash
cd Backend

npm install

npm run dev
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

---

# ⚙️ Environment Variables

## Backend

Create

```
Backend/.env
```

```env
PORT=5000

MONGODB_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_secret

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

EMAIL_FROM_NAME=LastMile

EMAIL_FROM=example@gmail.com

SMTP_HOST=smtp.gmail.com

SMTP_PORT=587

SMTP_USER=example@gmail.com

SMTP_PASS=your_app_password
```

---

## Frontend

Create

```
Frontend/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 📡 REST APIs

## Authentication

```
POST   /api/auth/register

POST   /api/auth/login

GET    /api/auth/me

PATCH  /api/auth/me
```

---

## Orders

```
POST   /api/orders

GET    /api/orders

GET    /api/orders/:id

PATCH  /api/orders/:id

PATCH  /api/orders/:id/status
```

---

## Zones

```
GET

POST

PATCH

DELETE

/api/zones
```

---

## Rate Cards

```
GET

POST

PATCH

DELETE

/api/ratecards
```

---

## Customers

```
GET

PATCH

DELETE

/api/admin/customers
```

---

## Agents

```
GET

POST

PATCH

DELETE

/api/admin/agents
```

---

# 📊 Database Collections

- Users
- Orders
- Zones
- RateCards

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role Based Authorization
- Immutable Tracking History

---

# 📈 Future Improvements

- Google Maps Integration

- Live GPS Tracking

- SMS Notifications

- OTP Verification

- Payment Gateway

- Route Optimization

- Delivery Analytics Dashboard

- AI Based Agent Assignment

---

# 👨‍💻 Author

## Rahul Kumar Maurya

B.Tech (Computer Science and Engineering)

Full Stack MERN Developer

GitHub

https://github.com/maurya-78

---

# 📄 License

This project was developed for educational purposes and Hackathon evaluation.

---

# ⭐ If you like this project

Please give this repository a ⭐ on GitHub.
