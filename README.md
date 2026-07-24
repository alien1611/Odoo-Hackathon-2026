# 🚀 AssetFlow ERP
### Enterprise Asset Management System

> A modern, scalable, full-stack ERP solution built for efficient enterprise asset management. Developed for the Odoo Hackathon 2026 with a strong focus on backend architecture, database design, modularity, performance, and real-world problem solving.

---

# 📌 Project Overview

AssetFlow ERP is an Enterprise Resource Planning (ERP) system designed to simplify the management of organizational assets, departments, employees, and inventory.

The application provides a centralized platform where administrators can manage assets, monitor inventory, organize departments, assign users, categorize resources, and maintain complete activity logs while ensuring scalability, security, and clean architecture.

The project emphasizes:

- Modular Backend Architecture
- Robust Database Design
- Enterprise-Level UI/UX
- Secure Authentication
- Real-Time Dynamic Data
- Performance & Scalability
- Clean Coding Standards

---

# 🎯 Problem Statement

Organizations often struggle with managing physical assets due to fragmented systems, manual tracking, lack of transparency, and poor inventory visibility.

AssetFlow ERP solves these challenges by providing:

- Centralized asset management
- Department-wise asset allocation
- User management
- Category organization
- Activity tracking
- Notification management
- Secure authentication
- Dynamic dashboards

---

# ✨ Features

## 🔐 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Password Hashing
- Protected Routes
- Session Management

---

## 👥 User Management

- Create Users
- Manage Employee Information
- Role-Based Access
- Department Assignment

---

## 🏢 Department Management

- Create Departments
- Edit Departments
- Delete Departments
- Department-wise Asset Tracking

---

## 📦 Asset Management

- Create Assets
- Update Asset Information
- Delete Assets
- Asset Allocation
- Asset Status Tracking

---

## 📂 Category Management

- Asset Categories
- Category CRUD Operations
- Organized Inventory Structure

---

## 🔔 Notification System

- User Notifications
- System Alerts
- Dynamic Notification Updates

---

## 📝 Activity Logs

- Audit Trail
- User Actions
- System Events
- Activity History

---

## 📊 Dashboard

- Total Assets
- Department Statistics
- User Statistics
- Inventory Overview
- Recent Activities
- Dynamic Data Visualization

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JWT
- bcrypt

---

# 🏗️ Architecture

The project follows a modular architecture.

```
Client (Next.js)
        │
        ▼
Express Backend
        │
        ▼
Controllers
        │
        ▼
Services
        │
        ▼
Repositories
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL
```

Each module is organized independently for maintainability and scalability.

---

# 📁 Project Structure

```
AssetFlow-ERP
│
├── client/
│     ├── app/
│     ├── components/
│     ├── lib/
│     └── styles/
│
├── server/
│     ├── src/
│     │      ├── modules/
│     │      ├── middleware/
│     │      ├── routes/
│     │      └── utils/
│
├── prisma/
│     ├── schema.prisma
│     └── migrations/
│
└── README.md
```

---

# 🗄️ Database Design

The database is designed with normalization, scalability, and referential integrity in mind.

Key entities include:

- Users
- Departments
- Assets
- Categories
- Notifications
- Activity Logs

Relationships are managed using foreign keys through Prisma ORM.

Highlights:

- Proper relational design
- Primary Keys
- Foreign Keys
- One-to-Many Relationships
- Indexed Queries
- Normalized Schema
- Scalable Structure

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Input Validation
- Protected Routes
- Error Handling
- Environment Variables
- Secure API Design

---

# ⚡ Performance

- Modular Backend
- Efficient Database Queries
- Prisma ORM Optimization
- Reusable Components
- Lazy Rendering
- Optimized React Components

---

# 🎨 UI/UX

The interface is inspired by modern enterprise software.

Design highlights:

- Glassmorphism
- Responsive Layout
- Modern Dashboard
- Professional Tables
- Responsive Forms
- Dark / Light Theme
- Smooth Animations
- Mobile Friendly

---

# 📦 Installation

## 1. Clone Repository

```bash
git clone https://github.com/alien1611/Odoo-Hackathon-2026
```

Example:

```bash
git clone https://github.com/alien1611/AssetFlow-ERP.git
```

---

## 2. Navigate to Project

```bash
cd AssetFlow-ERP
```

---

## 3. Install Backend Dependencies

```bash
cd server
npm install
```

---

## 4. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

# 🗄️ Database Setup

## Install PostgreSQL

Install PostgreSQL on your local machine.

Create a database:

```
assetflow
```

---

## Configure Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/assetflow"

JWT_SECRET=your_secret_key

PORT=5000
```

Update the username, password, and database name according to your local PostgreSQL installation.

---

## Run Prisma Migration

```bash
npx prisma migrate dev
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## (Optional) Seed Database

```bash
npm run seed
```

If a seed script is included, this will populate the database with sample data.

---

# ▶ Running the Backend

Inside the backend directory:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

# ▶ Running the Frontend

Inside the client directory:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# 🔑 Demo Credentials

If demo users are available:

```
Email:
admin@example.com

Password:
admin123
```

(Replace with actual demo credentials if applicable.)

---

# 📈 Future Scope

- Barcode Integration
- QR Code Tracking
- Email Notifications
- Purchase Orders
- Asset Depreciation
- Multi-Branch Support
- Analytics Dashboard
- Report Generation
- File Uploads
- Cloud Deployment

---

# 👨‍💻 Team

Developed by Team AssetFlow for the Odoo Hackathon 2026.

---

# 🙏 Thank You

Thank you for reviewing our project.

We appreciate your time and feedback.
