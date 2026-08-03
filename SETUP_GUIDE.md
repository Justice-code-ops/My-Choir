# Voice of Light Chorale - Full Stack Setup & Running Guide

## Prerequisites

- Node.js 20+ installed
- npm 10+ installed
- MongoDB 4.0+ (for local development) OR MongoDB Atlas account
- Git

## Project Structure

```
voice-of-light/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── api/           # API client
│   │   ├── context/       # State management (Zustand)
│   │   ├── routes/        # Router configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.local
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── models/        # MongoDB schemas
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities
│   │   ├── config/        # Configuration
│   │   ├── constants/     # Constants
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   ├── .env
│   └── uploads/           # File storage
│
├── package.json           # Monorepo config
└── README.md

```

## Installation

### 1. Install Root Dependencies

```bash
cd "c:\Users\HomePC\Documents\VOICE OF LIGHT"
npm install
```

This installs the top-level `concurrently` package that allows running both servers at once.

### 2. Backend Setup

```bash
cd server
npm install
```

The backend is already configured with all necessary dependencies:

- Express.js
- MongoDB/Mongoose
- JWT authentication
- Multer for file uploads
- Cloudinary integration
- And more...

### 3. Frontend Setup

```bash
cd ../client
npm install
```

This installs:

- React & React Router
- Axios for HTTP requests
- Tailwind CSS
- React Hook Form
- React Icons
- Zustand for state management

## Configuration

### Backend (.env file already created)

**Location:** `server/.env`

Already configured with:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/voice_of_light
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345678
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
MONTHLY_DUE=500
```

**If using MongoDB Atlas instead:**

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/voice_of_light
```

### Frontend (.env.local already created)

**Location:** `client/.env.local`

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Voice of Light Chorale
```

## Running the Application

### Option 1: Run Everything (Recommended)

From the root directory:

```bash
npm run dev
```

This starts:

- **Backend API** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

### Option 2: Run Separately

**Terminal 1 - Backend:**

```bash
npm run server
# or
cd server && npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run client
# or
cd client && npm run dev
```

## Seeding Demo Data

Before testing, populate the database with demo data:

```bash
cd server
npm run seed
```

This creates:

- **Admin account:** admin@voiceoflight.local / AdminPass123!
- **Member account:** member@voiceoflight.local / MemberPass123!
- 8 additional demo members
- 3 sample events
- Payment and attendance records
- Notifications and content

## Accessing the Application

### Public Site

- **URL:** `http://localhost:5173`
- **Pages:** Home, About, Events, Gallery, Blog, Contact

### Login

- **URL:** `http://localhost:5173/auth/login`
- Use demo credentials from seeding

### Member Dashboard

- **URL:** `http://localhost:5173/member/dashboard`
- Available after login as a member

### Admin Dashboard

- **URL:** `http://localhost:5173/admin/dashboard`
- Available after login as admin

### Backend API Health Check

- **URL:** `http://localhost:5000/api/health`

## API Endpoints Summary

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
PUT    /api/auth/profile
```

### Members

```
GET    /api/members/profile
GET    /api/members
GET    /api/members/:id
GET    /api/members/search/query
PUT    /api/members/:id
GET    /api/members/:id/stats
```

### Approvals

```
GET    /api/approvals
POST   /api/approvals/:id/approve
POST   /api/approvals/:id/reject
POST   /api/approvals/:id/correct
GET    /api/approvals/stats
```

### Payments

```
POST   /api/payments
GET    /api/payments
GET    /api/payments/:memberId/history
GET    /api/payments/:memberId/balance
GET    /api/payments/receipt/:receiptNumber
PATCH  /api/payments/:id/status
```

### Attendance

```
POST   /api/attendance/check-in
POST   /api/attendance/record
GET    /api/attendance/:memberId/history
GET    /api/attendance/:memberId/stats
GET    /api/attendance/report
```

### Admin

```
GET    /api/admin/dashboard
GET    /api/admin/members/stats
GET    /api/admin/financial-stats
GET    /api/admin/audit-logs
GET    /api/admin/export/members
```

### Public

```
GET    /api/public/events
GET    /api/public/events/upcoming
GET    /api/public/events/:id
GET    /api/public/gallery
GET    /api/public/blog
GET    /api/public/blog/:slug
GET    /api/public/announcements
GET    /api/public/executives
POST   /api/public/contact
GET    /api/public/church-info
```

### Notifications

```
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
```

### ID Card

```
GET    /api/id-card/my-card
GET    /api/id-card/:memberId/generate
GET    /api/id-card/:memberId/download
GET    /api/id-card/verify/:choirId
```

## Troubleshooting

### Port Already in Use

```bash
# Backend (5000)
npx kill-port 5000

# Frontend (5173)
npx kill-port 5173
```

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify database name: `voice_of_light`

### CORS Errors

- Check `CORS_ORIGINS` in `server/.env`
- Ensure frontend URL matches: `http://localhost:5173`

### Module Not Found

```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

### Hot Reload Not Working

- Vite should automatically reload on file changes
- Check that `npm run dev` is running the Vite dev server

## Building for Production

### Frontend Build

```bash
cd client
npm run build
```

Generates optimized build in `client/dist/`

### Backend Deployment

```bash
cd server
npm run start
```

## Next Steps

1. **Build Login/Register UI** - Implement full registration form with validation
2. **Member Dashboard** - Create dashboard with stats, payments, attendance
3. **Admin Dashboard** - Build analytics and management interfaces
4. **Payment Integration** - Connect to Paystack or Flutterwave
5. **ID Card Generation** - Implement PDF export functionality
6. **Notifications** - Add real-time notification system
7. **Testing** - Write unit and integration tests
8. **Deployment** - Deploy to production (Vercel, Heroku, etc.)

## Tech Stack Summary

**Frontend:**

- React 18 with Vite
- React Router v6
- Tailwind CSS with dark mode
- Zustand for state management
- Axios for HTTP requests
- React Hook Form for forms

**Backend:**

- Node.js/Express
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- Cloudinary for cloud storage
- Express Validator

**DevTools:**

- ESLint for code quality
- Morgan for request logging
- Helmet for security headers

## Support

For any issues or questions, refer to:

- Backend: `server/README.md` (to be created)
- Frontend: `client/README.md` (to be created)
- API Documentation: See API endpoints above
