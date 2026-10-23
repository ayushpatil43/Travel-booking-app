# QTrip — Travel and Activity Booking Platform

A full-stack **MERN** travel application built with an authentic, non-AI **Sage Green & Olive Stone** and **Blush (`#E1CBBC`)** aesthetic. Features dynamic component generation, real-time cost calculation, comprehensive form validation, and full booking management.

---

## 🌿 Key Features
- **Dynamic Component Generation**: Adding new destinations automatically creates and mounts UI elements.
- **End-to-End Reservations**: Real-time cost calculation with adult/child guest breakdown, optional add-ons, promo discounts (`SAGE10`), and 5% service fee.
- **Form Validation & Vouchers**: Inline validation checks producing printable boarding passes with booking reference codes and barcodes.
- **Booking Management**: Real-time reservation status tracking and 48-hour flexible cancellation refunds.
- **Full-Stack Architecture**: React (Vite) frontend + Node.js/Express REST API + MongoDB (with Mongoose & structured storage fallback).

---

## 🚀 Quick Start (Local)

### Method 1: Single Command
```bash
npm run dev
```

### Method 2: Two Terminals
```bash
# Terminal 1 - Backend (Port 5000)
cd backend && npm start

# Terminal 2 - Frontend (Port 3000)
cd frontend && npm run dev
```

---

## ☁️ Deployment on Vercel
- **Build Command**: `node build.js`
- **Output Directory**: `dist`
- **Serverless API**: Handled automatically via `/api/index.js`
