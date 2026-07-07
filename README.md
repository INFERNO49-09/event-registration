#  EventHub

A full-stack event registration platform built with React, Node.js, Express, MongoDB, Google OAuth, Razorpay, and Tailwind CSS.

---

## Features

### User Features

- Google OAuth Login
- Browse Events
- View Event Details
- Register for Events
- Razorpay Payment Integration
- My Events Dashboard
- Registration Tracking

### Admin Features

- Admin Dashboard
- Create Events
- Delete Events
- Revenue Analytics
- Registration Analytics
- Export Registrations to CSV

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- Google OAuth 2.0
- Razorpay

---

## Project Structure

```text
eventhub/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── .env
│
└── README.md
```

---

# Installation

## Prerequisites

Install:

- Node.js (v20 or newer)
- Git
- MongoDB Atlas Account
- Google Cloud Account
- Razorpay Account

Verify installation:

```bash
node -v
npm -v
git --version
```

---

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/eventhub.git

cd eventhub
```

---

# Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

If required:

```bash
npm install express mongoose cors dotenv express-session passport passport-google-oauth20 razorpay csv-writer
```

---

## Backend Environment Variables

Create:

```text
backend/.env
```

Add:

```env
PORT=5000

MONGO_URI=

SESSION_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

FRONTEND_URL=http://localhost:5173
```

---

# MongoDB Setup

1. Create a free cluster on MongoDB Atlas.
2. Create a database user.
3. Allow access from your IP.
4. Copy the connection string.

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventhub
```

---

# Google OAuth Setup

1. Open Google Cloud Console.
2. Create a project.
3. Configure OAuth Consent Screen.
4. Create OAuth Credentials.

Authorized JavaScript Origin:

```text
http://localhost:5173
```

Authorized Redirect URI:

```text
http://localhost:5000/auth/google/callback
```

Copy values into:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

# Razorpay Setup

1. Create a Razorpay account.
2. Open Dashboard.
3. Generate Test API Keys.

Add:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

to backend `.env`.

---

# Start Backend

Development:

```bash
npm run dev
```

or

```bash
node server.js
```

Expected output:

```text
MongoDB Connected
Server running on port 5000
```

---

# Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

If required:

```bash
npm install axios react-router-dom tailwindcss @tailwindcss/vite
```

---

## Frontend Environment Variables

Create:

```text
frontend/.env
```

Add:

```env
VITE_RAZORPAY_KEY_ID=
```

⚠ Never expose:

```env
RAZORPAY_KEY_SECRET
```

in the frontend.

---

# Tailwind CSS Setup

## vite.config.js

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

---

## src/index.css

```css
@import "tailwindcss";

body {
  margin: 0;
  min-height: 100vh;
  background: #020617;
  font-family: Inter, sans-serif;
}
```

---

# Razorpay Checkout Script

Open:

```text
frontend/index.html
```

Add before `</body>`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

# Start Frontend

```bash
npm run dev
```

Expected:

```text
Local: http://localhost:5173
```

---

# Running The Application

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Application Flow

## User Flow

```text
Login
 ↓
Browse Events
 ↓
View Event
 ↓
Register
 ↓
Pay
 ↓
Registration Success
 ↓
My Events
```

---

## Admin Flow

```text
Login
 ↓
Admin Dashboard
 ↓
Create Event
 ↓
Monitor Revenue
 ↓
Export CSV
 ↓
Manage Events
```

---

# Security

Create `.gitignore`:

```gitignore
node_modules/
.env
dist/
build/
.vscode/
```

Never commit:

```text
.env
Google OAuth Secrets
MongoDB URI
Razorpay Secret Keys
Session Secrets
```

Create `.env.example`:

```env
MONGO_URI=

SESSION_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

# Deployment

## Frontend

Deploy using Vercel.

## Backend

Deploy using Render.

## Database

Use MongoDB Atlas.

---

# Future Improvements

- QR Ticket Generation
- Email Confirmation
- Cloudinary Image Uploads
- Event Categories
- Search & Filtering
- Attendance Scanning
- Revenue Charts
- Mobile App

---

# License

MIT License

---

Built with ❤️ using React, Express, MongoDB, Google OAuth, Razorpay, and Tailwind CSS.
