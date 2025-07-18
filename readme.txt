# SIGAM (Système d'information de gestion des acivités minières)

SIGAM is a modern web application built to manage mining permit applications, procedure tracking, renewal flows, payments, user roles, and more. It is developed using a modern fullstack stack: **Next.js**, **React**, **NestJS**, **Prisma**, **PostgreSQL**, and **Ant Design**.

---
## outils : 
-react": "^19.1.0"
-node:v22.15.0
-@nestjs/core@11.1.3
-TypeScript:5.8.3
-prisma:6.10.1
-next@15.3.4
## 🚀 Tech Stack & Tools

### Frontend:

* **React (with Next.js App Router)**
* **Tailwind CSS + CSS Modules** for UI
* **Ant Design** components for rich inputs (DatePickers, Modals, Forms...)
* **Lucide Icons** and **React Icons**
* **Axios** for HTTP requests
* **zustand** for global auth state (`useAuthStore`)
* **Dynamic imports** for code splitting

### Backend:    ## matensaaaaach lzm asem la base de données ta3k ykon asemha sigam

* **NestJS** (Modular structure)
* **Prisma** ORM
* **PostgreSQL** database
* **JWT Authentication** with cookies
* **RBAC** (Role-Based Access Control) using permissions
* **REST API** endpoints (e.g., `/api/procedures`, `/api/renouvellement`, etc.)
* **Middleware authorization** in Next.js for route protection

### Dev Tools:

* ESLint & Prettier
* dotenv
* `prisma studio` for DB inspection

---

## ⚙️ Features

* **User login with JWT + cookies**
* **Role and permission-based UI rendering & route protection**
* **Start new permit applications with multi-step forms**
* **Track current procedural phase**
* **Calendar popup to select submission date**
* **Handle renewals using a separate procedure flow**
* **Prevent renewals unless required payments are completed**
* **Secure middleware route protection**
* **Admin Panel (restricted by role)**
* **Dynamic dashboard views per user**
* **Soft delete and confirmation modals**

---

## 📁 Project Structure

### Frontend (`/pages`):

* `/demande` - Multi-step demande forms
* `/dashboard/suivi_procedure` - Permit tracking dashboard
* `/permis_dashboard` - Redirect page
* `/DEA/DEA_dashboard` - Payment management
* `/components` - `Sidebar`, `Navbar`, reusable UI
* `/hooks` - `useViewNavigator`, `useAuthStore`

### Backend (`/server`):

* `/auth` - login, `me` endpoint
* `/procedure` - CRUD for permit applications
* `/procedure_renouvellement` - Renewal flow
* `/demande` - original and renewal demandes
* `/middleware.ts` - Next.js route protection

---

## ⚡ Installation

### 1. Clone the repository:

```bash
git clone https://github.com/brahimkedjar/sigam.git
cd sigam
```

### 2. Install dependencies:

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Configure environment variables:

Create `.env` files:

**Frontend (`client/.env`)**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=ANAM_dev2025@
```

**Backend (`server/.env`)**

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sigam"
JWT_SECRET=ANAM_dev2025@
PORT=3001
```

### 4. Set up the database:

```bash
cd backend
npx prisma migrate dev --name init
npx ts-node prisma/run-all-seeds.ts      ##hana ydirlek kaml data prédifini fel database

```

### 5. Run the servers:

```bash
# Start backend
cd backend
npm run start:dev

# Start frontend
cd ../frontend
npm run dev
```

---

## 💼 Database Schema Highlights

### Prisma Models Used:

* `User` (with roles + permissions)
* `Procedure`
* `ProcedureEtape`
* `Demande`
* `ProcedureRenouvellement`
* `Permis`
* `Paiement`

Includes enums like `StatutDemande`, `StatutProcedure` for consistent status tracking.
---

## ⛔ Route Protection

Using `middleware.ts`, we:

* Block `/dashboard`, `/DEA`, `/admin_panel`, etc. for unauthorized users
* Redirect already logged-in users away from `/`
* Validate token with NestJS `/auth/me` endpoint
* Redirect users with missing permissions to `/unauthorized/page`

---

## 🚩 Security Checklist

* [x] JWT validation via backend
* [x] Permissions enforced via frontend and middleware
* [x] Protected routes using `middleware.ts`
* [x] Token stored as HTTP-only cookie
* [x] Server checks for payment completion before renewals
* [x] User cannot access login page when already authenticated

---

************

Once installed and seeded, simply login via `/` and start managing permit applications, payments, renewals, and procedural tracking!

---

For questions or issues, contact: **[jemskedjar@gmail.com]** or raise a GitHub issue.

---

Made with ❤️ using NestJS, Prisma & Next.js.