# Complete Project Handover Document — CRM System (Frontend & Backend)

Welcome to the **CRM System** codebase! This handover document is designed to get a new developer up to speed on the architecture, setup, technology stack, directory structure, core features, database models, and background services of both the **Frontend** and **Backend** applications.

---

## 1. Executive Summary & Architecture Overview

The system is a full-stack Enterprise Resource & Customer Relationship Management (CRM) platform built to manage:
- **Employees & Interns** (Applications, Probation, Roles, Granular Permissions, Mentorship)
- **Projects & Tasks** (Task status logging, due date tracking, team allocation)
- **Work Logs & Client Communications / Calls**
- **Leave Management** (Adjacent leave checks, Saturday exchanges, medical upload proofs, automated calculations, balance history)
- **Offer Letter Generation** (Dynamic PDF / DOCX creation)
- **Real-Time Notifications** (WebSockets via Socket.IO)
- **Automated Email Notifications** (HTML templates for leave approvals/rejections)
- **AI Integration** (Google Gemini AI for event previews & content generation)

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                      Client Web App                     │
│    React 19 + Vite + TailwindCSS + MUI + Context API    │
└────────────────────────────┬────────────────────────────┘
                             │ Axios (JWT Bearer) + Socket.IO
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     Node.js / Express                   │
│   Auth / RBAC Middlewares + Controllers + Cron Tasks    │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   PostgreSQL / MySQL     │    │ External Services:       │
│  (Sequelize ORM Models)  │    │  • SMTP (Nodemailer)     │
└──────────────────────────┘    │  • Gemini AI             │
                                │  • Local Storage Uploads │
                                └──────────────────────────┘
```

---

## 2. Technology Stack & Prerequisites

### Frontend (`c:\Vaidik\React\crm`)
- **Core**: React 19 (`react` v19.2.5, `react-dom`)
- **Build Tool**: Vite (`vite` v8.0.10)
- **Styling**: TailwindCSS v4 (`@tailwindcss/vite`), Material UI (`@mui/material` v9.3.1, `@mui/x-data-grid`)
- **State Management**: React Context API (20 Context Providers) + Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing**: React Router DOM v7 (`react-router-dom` v7.15.0)
- **Icons & Animations**: React Icons (`react-icons`), Framer Motion (`motion` v13.1.0)
- **HTTP Client**: Axios with request/response interceptors (`axiosInstance.js`)
- **Real-time**: `socket.io-client` (v4.8.3)
- **Utilities**: `html-to-image`, `react-hot-toast`, `vite-plugin-pwa`

### Backend (`C:\Vaidik\backend\CRM`)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database & ORM**: Sequelize ORM (`sequelize`, `sequelize-cli`) connecting to MySQL / PostgreSQL
- **Authentication**: JWT (`jsonwebtoken`), Password Hashing (`bcrypt` / `bcryptjs`)
- **File Uploads**: Multer (`multer`)
- **Emailing**: Nodemailer (`nodemailer`) with custom HTML templates
- **Cron / Scheduling**: `node-cron` for due date alerts, notification purges, and event cleanups
- **AI Integration**: `@google/generative-ai` (Gemini API service)
- **Documentation**: Swagger UI (`swagger-ui-express`, `swagger-autogen`)

---

## 3. Repository Directory Structure

### Frontend Directory Structure (`c:\Vaidik\React\crm\src`)
```
src/
├── api/
│   ├── axiosInstance.js    # Axios setup with JWT header injection & auto 401 redirect
│   ├── endpoints.js        # Centralized REST API endpoint dictionary
│   └── internApi.js        # Specialized Intern API handlers
├── assets/                 # SVGs, images, static media
├── components/
│   ├── common/             # Header, Sidebar, HeaderLogo, TopBar
│   ├── layout/             # MainLayout, AuthLayout, DashboardLayout
│   ├── leaves/             # ApplyLeaveModal, LeaveBalanceCards, SaturdayExchangeModal
│   ├── OfferLetter/        # Offer letter preview & download UI
│   ├── ui/                 # Reusable buttons, badges, modals, cards
│   ├── AdminRoute.jsx      # Admin guard wrapper
│   └── ProtectedRoute.jsx  # Auth guard wrapper
├── context/                # 20+ specialized React Contexts (AuthContext, TaskContext, LeaveContext, SocketContext, etc.)
├── features/               # Modular slice features
├── hooks/                  # Custom React hooks (e.g. usePWAInstall.js)
├── pages/
│   ├── admin/              # Dashboard, Employees, Calls, Projects, Tasks, WorkLogs, Leaves, Roles, Permissions, Export, CompanySettings
│   ├── employee/           # MyDashboard, MyProfile, MyCalls, MyProjects, MyTasks, MyWorkLogs, MyLeave, MyTeam, Mentorship
│   ├── Login.jsx           # Unified Login page
│   └── TeamDashboard.jsx   # Team overview dashboard
├── store/                  # Redux store configuration & uiSlice.js
└── utils/                  # Helper utilities (date formatters, validators)
```

### Backend Directory Structure (`C:\Vaidik\backend\CRM\src`)
```
src/
├── config/                 # Database connection, config.json, environment configs
├── controllers/            # Controller layer logic (auth, users, calls, projects, tasks, leaves, intern, offerLetter, etc.)
├── middlewares/            # Auth middleware, role middleware, permission middleware, multer uploaders
├── models/                 # Sequelize models (User, Role, Permission, Task, LeaveRequest, Intern, Call, OfferLetter, etc.)
├── routes/                 # Express router modules mapping to controllers
├── services/               # Gemini AI, JWT Service, Password Service, Employee ID Service
├── utils/                  # Cron jobs, Mailer, Date helpers, Email templates
│   ├── emailTemplates/     # HTML email designs (Leave request, approval, rejection, upload alerts)
│   └── dueDateCron.js      # Background scheduled jobs
└── uploads/                # Local storage for leave medical proofs, offer letters, documents
```

---

## 4. Local Environment Setup & Run Guide

### 1. Backend Setup (`C:\Vaidik\backend\CRM`)
```bash
cd C:\Vaidik\backend\CRM

# 1. Install dependencies
npm install

# 2. Configure Environment Variables
# Copy or create .env file with the following variables:
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=crm_db
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
GEMINI_API_KEY=your_gemini_key

# 3. Database Migration & Seed Data
npx sequelize-cli db:migrate
node seed-admin.js       # Seed default Admin account

# 4. Generate Swagger API Docs (Optional)
node swagger.js

# 5. Start Server
npm run dev              # Starts nodemon dev server on http://localhost:5000
```

### 2. Frontend Setup (`c:\Vaidik\React\crm`)
```bash
cd c:\Vaidik\React\crm

# 1. Install dependencies
npm install

# 2. Configure Environment Variables (.env)
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# 3. Start Frontend Dev Server
npm run dev              # Launches Vite dev server (usually http://localhost:5173)

# 4. Build for Production
npm run build
```

---

## 5. Key Modules & Functional Overview

### 1. Authentication & Authorization
- **JWT Authentication**: Token stored in `localStorage` under key `accessToken`.
- **Role-Based Access Control (RBAC)**: Users are assigned `Role`s and custom `Permission` lists.
- **Protected Routes**: Frontend uses `<ProtectedRoute>` and `<AdminRoute>` wrappers; Backend uses `auth.middleware.js` and `permission.middleware.js`.

### 2. Leave Management Subsystem
- **Adjacent Leave Check**: Validates whether a leave bridges weekends or holidays (`adjacent-check`).
- **Saturday Exchange**: Employees can mark/exchange Saturday work for compensatory leaves.
- **Medical Proof Uploads**: Uses Multer (`leaveUpload.js`) to attach documents for sick leaves.
- **Automated Emails**: Sends HTML notification emails via `mailer.js` on leave request, approval, rejection, or document upload.

### 3. Intern & Mentorship Portal
- **Intern Registration**: Public form for intern registration (`/intern/register`).
- **Mentor Assignment**: Employees act as mentors to assign projects (`INTER_PROJECT`), tasks (`INTER_TASKS`), and view intern work logs (`INTER_WORKLOGS`).

### 4. Offer Letter Generator
- Dynamic position & address template configuration.
- Generates official PDF and DOCX offer letters using employee/candidate details.

### 5. Background Crons & Real-Time Sockets
- **Task Due Date Cron**: `dueDateCron.js` checks for impending deadlines and sends notifications.
- **WebSockets**: Socket.IO server pushes live notifications to the frontend bell icon (`NotificationBell.jsx`).

---

## 6. Endpoints Reference Summary (`endpoints.js`)

| Category | Endpoint | Method / Description |
| :--- | :--- | :--- |
| **Auth** | `/auth/login`, `/auth/logout` | Login & Token Revocation |
| **Users** | `/users` | Admin User CRUD |
| **Calls** | `/calls` | Call activity logging & tracking |
| **Projects** | `/projects`, `/projects/:id/members` | Manage Projects & Team Allocations |
| **Tasks** | `/tasks`, `/tasks/:id/status-logs` | Task CRUD & Audit Trail |
| **Leaves** | `/leaves/request`, `/leaves/all`, `/leaves/approve/:id` | Full Leave Lifecycle |
| **Interns** | `/intern/register`, `/admin/interns`, `/interns/my-mentored` | Intern Onboarding & Mentorship |
| **Offer Letter** | `/offer-letter/positions`, `/offer-letter/generate/:id` | Template management & PDF/DOCX export |
| **Events** | `/events`, `/events/announce`, `/events/ai-preview` | Event broadcasting & Gemini AI generation |

---

## 7. Developer Onboarding Recommendations & Checklist for New Devs

1. **Database Setup**: Ensure MySQL/PostgreSQL is running and migrations applied via `npx sequelize-cli db:migrate`.
2. **Admin Credentials**: Run `node seed-admin.js` to create the initial admin user to log into the UI.
3. **Environment Sync**: Check that `VITE_API_URL` matches the running port of the backend Express server.
4. **Code Conventions**:
   - Frontend state is divided between React Context (domain data) and Redux (UI toggles).
   - Use `axiosInstance` for API calls to ensure JWT header propagation and 401 handling.
   - All backend responses follow standard JSON formats: `{ success: true, message: "...", data: ... }`.

---
*Handover Document generated for incoming developer.*
