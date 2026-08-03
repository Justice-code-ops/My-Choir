# Voice of Light Choir Management System

Voice of Light has been refactored from a static FormSubmit registration page into a full-stack choir management system. The preserved identity includes the original logo, the "Voice of Light Chorale" name, the "Your Voice, Our Harmony" message, SATB voice parts, and the registration/terms intent from the starter site.

## Repository Review

The referenced GitHub repository contains a static `index.html` registration form, a `terms.html` policy page, Tailwind input/output CSS, one logo image, and a committed `node_modules` folder. There was no React application, no backend, no database layer, and no authentication workflow to preserve.

Because the local working tree was empty and `git fetch` timed out on the remote dependency dump, the useful source was reviewed through the GitHub API and rebuilt locally as a clean monorepo.

## Architecture

- `client/` contains the React, React Router, Tailwind CSS, Axios, React Hook Form, and React Icons frontend.
- `server/` contains the Node.js, Express, MongoDB/Mongoose, JWT, Multer, Cloudinary-ready backend.
- Backend code is organized by controllers, routes, models, middleware, services, config, and utilities.
- Public pages use demo content while trying API calls first, so the interface is useful before the database is seeded.
- Member and admin areas use protected routes and role checks.
- Uploads use Cloudinary when configured and fall back to local development storage.

## Feature Coverage

- Public landing page, about, executives, departments, gallery, events, blog/news preview, and contact.
- Member registration with approval statuses: pending, approved, rejected, correction, suspended.
- JWT login restricted to approved users.
- Digital ID card payload with QR verification route.
- Member dashboard with profile, payments, attendance, resources, announcements, birthdays, prayer, testimony, volunteering, suggestions, and dark mode entry points.
- Admin dashboard with analytics, pending registrations, member management, payments, attendance, content, reports, and settings.
- Monthly dues tracking at NGN 500 per month, payment history, receipts, and payment-provider abstraction hooks.
- Attendance check-in by QR/code/manual, late status, reports, and analytics helpers.
- Notifications, audit logs, contact messages, organization items, events, and content library models.
- PWA manifest and service worker scaffold for installability and offline shell caching.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the backend environment template:

   ```bash
   cp server/.env.example server/.env
   ```

3. Update `server/.env` with MongoDB, JWT, Cloudinary, and app URLs.

4. Seed sample data:

   ```bash
   npm run seed
   ```

5. Start both apps:

   ```bash
   npm run dev
   ```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000/api/health`

## Demo Access After Seeding

- Admin: `admin@voiceoflight.local` / `AdminPass123!`
- Member: `member@voiceoflight.local` / `MemberPass123!`

## Suggested Next Phases

1. Connect a real payment processor and webhook handler.
2. Add PDF rendering for receipts, reports, certificates, and ID cards.
3. Add email/SMS delivery providers for notification dispatch.
4. Add automated tests around approval, payment balances, and attendance reports.
5. Replace placeholder public photography with approved church/choir media.

