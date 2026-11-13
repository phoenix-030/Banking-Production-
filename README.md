# HHK Banking Exam Preparation Platform

A modern, production-grade web application tailored for Indian banking recruitment examinations (IBPS, SBI, RBI, NABARD, and Other Financial Institutions). The platform provides a full student workspace (timed CBT mock tests, daily challenges, topic-wise practice, bookmarks, live milestones) alongside an administrative control center (exam pattern configuration, question bank importing, student management, attempt grading, and audit logs).

> [!TIP]
> For the complete system architecture, data models, entity relationships, and API lifecycle maps, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

> [!IMPORTANT]
> ### ⚡ Quick Run (Single Command)
> To launch the entire application (both backend Express API and frontend Vite React app together):
> ```powershell
> npm run dev
> ```
> - **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
> - **Backend REST API**: [http://localhost:3001](http://localhost:3001)

---

## What's New: Production Refactoring & Upgrades

1. **Clean Production-Level Architecture**:
   - Distinct, decoupled layers: `client/` (Frontend SPA), `server/` (Node.js API), `shared/` (shared models/constants), `docs/` (specifications), `scripts/` (build/dev utilities), and `tests/` (integration test suites).
2. **Pure JavaScript & JSX Transition**:
   - Converted 100% of frontend components from TypeScript to pure React 19 JSX (`.jsx`/`.js`).
   - Converted 100% of backend services and routes to pure Node.js ES Modules (`.js`).
   - Eliminated TypeScript compiler overhead (`tsc`) for instant server startups with native Node.js `--watch`.
3. **Master Exam Catalogue (19 Exams Across 5 Categories)**:
   - **IBPS**: PO, CSA, SO, RRB PO, RRB Scale II, RRB Scale III, RRB Office Assistant (7)
   - **SBI**: PO, Clerk, SO (3)
   - **RBI**: Grade B, Assistant (2)
   - **NABARD**: Grade A, Grade B (2)
   - **Other Banks / Institutions**: IDBI, SIDBI, ECGC, EXIM, IIFCL (5)
4. **Question Bank Auto-Mock Sync (20-Question Threshold)**:
   - Once an administrator uploads at least 20 published questions for an exam stage, the platform automatically generates and publishes a full dynamic mock test available to students.
5. **Dynamic Option Shuffling**:
   - Answer choices (A, B, C, D) are randomly permuted on every student attempt, preventing pattern memorization while tracking the correct answer accurately on the backend.
6. **Daily 1-Question Challenge**:
   - Daily question selector that tracks consecutive study days (streaks) and unlocks live milestone trophies.
7. **Proctored CBT Exam Experience**:
   - **Single-Tab Lock**: BroadcastChannel detects duplicate tabs and automatically locks secondary sessions.
   - **Fullscreen Enforcement**: Alerts and auto-submits on repeated escape attempts.
   - **Mouse-Only Mode**: Prevents unauthorized keyboard shortcuts during tests.
   - **Dummy Camera Monitor**: Local webcam mirror providing simulated proctoring without recording or leaking student video.
8. **DevTools Security & Code Concealment**:
   - Production Vite builds disable source maps (`sourcemap: false`) and block direct DevTools requests to source paths and configuration files.

---

## Directory Structure

```text
BANKING-PLATFORM/
├── client/                               # Frontend Single-Page Application (React 19, pure JSX)
│   ├── index.html                        # Application HTML entry point
│   ├── vite.config.js                    # Vite configuration (source blocking, API proxy, CSP)
│   ├── public/                           # Static brand logos (hhk-logo.png, hik-logo.png)
│   └── src/
│       ├── main.jsx                      # React entry mounting
│       ├── App.jsx                       # Root routing, toasts, tab lockout listener
│       ├── AuthPage.jsx                  # Sign-in, sign-up, forgot/reset password
│       ├── AdminOverview.jsx             # Admin dashboard landing
│       ├── AdminPanel.jsx                # Full administration portal
│       ├── StudentWorkspace.jsx          # Student preparation dashboard
│       ├── api/
│       │   └── client.js                 # Authenticated fetch wrapper
│       ├── components/
│       │   ├── common/                   # Field.jsx, ExamOptGroups.jsx
│       │   ├── auth/                     # AuthBrand, LoginForm, RegisterForm, etc.
│       │   ├── admin/                    # ExamSetupView, QuestionBankView, MockTestBuilderView, etc.
│       │   └── student/                  # TestRunner, PracticeRunner, DailyChallengeView, etc.
│       ├── styles/                       # Modular CSS stylesheets (admin, auth, student, etc.)
│       └── utils/
│           ├── examCategories.js         # Master banking category groupings
│           └── examLock.js               # Single-tab proctoring and fullscreen helpers
│
├── server/                               # Backend API (Node.js ES Modules, pure JS)
│   ├── index.js                          # Express app, Helmet, session store, static fallback
│   ├── db.js                             # pg.Pool connection with SSL and timeouts
│   ├── middleware.js                     # requireAuth, requireAdmin, Zod validator
│   ├── schemas.js                        # Request/response validation schemas
│   ├── migrate.js                        # SQL migration runner
│   ├── seed-admin.js                     # Administrator account bootstrapping
│   ├── migrations/                       # 001 through 014 SQL migrations
│   ├── routes/                           # admin.js, attempts.js, auth.js, content.js
│   └── services/                         # questionBankSync.js, questionSelection.js, milestones.js
│
├── shared/                               # Shared constants & logic between client and server
│   ├── constants.js                      # EXAM_CATEGORIES list
│   └── examCategories.js                 # groupExamsByCategory helper
│
├── docs/
│   └── ARCHITECTURE.md                   # Complete architectural guide & data flow map
│
├── scripts/
│   ├── build-web.mjs                     # Production client build runner
│   └── dev-protected.mjs                 # Protected dev server with hot reload & source blocking
│
├── tests/
│   └── verify_workflow.js                # Integration suite verifying all 6 platform workflows
│
├── .env, .env.example, .gitignore
├── docker-compose.yml
└── package.json
```

---

## Prerequisites

- **Node.js**: Version 20 or 22+ installed ([nodejs.org](https://nodejs.org/))
- **PostgreSQL**: PostgreSQL 15+ running locally (or via Docker Desktop)

---

## Quick Start & Setup

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment (`.env`)

Create your `.env` file from the example template:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure your credentials:

```env
# Database Configuration
POSTGRES_PASSWORD=your_postgres_password
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/your_database_name
DATABASE_SSL=false

# Server & Session
PORT=3001
NODE_ENV=development
SESSION_SECRET=replace-with-at-least-32-random-characters
APP_URL=http://localhost:5173

# Admin Account Seeding
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password-12-or-more-characters
ADMIN_FULL_NAME=HHK Administrator
ADMIN_MOBILE=+919876543210

# SMTP Email (Optional - needed for password reset emails)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

> [!NOTE]
> If your database name contains spaces, URL-encode the space as `%20` (e.g. `postgresql://postgres:TIGER@localhost:5432/HHK%20Administrator`).

### 3. Setup the Database

Apply all SQL migrations and seed the initial administrator:

```powershell
# Run all 14 database migrations
npm run db:migrate

# Seed your default administrator account
npm run db:seed-admin
```

*(If using Docker Desktop for PostgreSQL instead of a local install, run `docker compose up -d postgres` before running `npm run db:migrate`)*.

---

## 🚀 How to Run the Project

### 1. Development Mode (All-in-One Command)

Starts both the backend Express API server and the Vite React frontend concurrently with live reloading:

```powershell
npm run dev
```

| Component | URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | Vite preview client with DevTools code-protection and `/api` proxy |
| **Backend API** | [http://localhost:3001](http://localhost:3001) | Express REST API connected to PostgreSQL with native `node --watch` |

> [!NOTE]
> - Backend changes automatically reload instantly with zero compilation delay.
> - Frontend changes are automatically detected and rebuilt cleanly.

---

### 2. Running Services in Separate Terminals

If you prefer dedicated terminal sessions for separate log monitoring:

**Terminal 1 — Backend Express Server (Port 3001):**
```powershell
npm run dev:server
```

**Terminal 2 — Frontend Client (Port 5173):**
```powershell
npm run dev:client
```

---

### 3. Production Mode (Single Port 3001)

In production, Express serves both the pre-built, optimized client bundle and all API endpoints on a single port:

```powershell
# Step 1: Ensure database schema is migrated
npm run db:migrate

# Step 2: Compile the frontend into client/dist/ (with sourcemap: false)
npm run build

# Step 3: Launch the unified production server
npm start
```

- **Production App**: [http://localhost:3001](http://localhost:3001)

---

## Verification & Testing

The project includes an end-to-end workflow verification script that validates the core business rules inside an isolated, safe rollback transaction (zero test data pollution):

```powershell
npm test
```

**Verifies:**
1. Master exam categorization logic in `shared/`.
2. PostgreSQL database connectivity.
3. Master exam count (all 19 exams across all 5 banking categories).
4. Question Bank 20-question threshold auto-mock test creator.
5. Dynamic option shuffler and answer strip validation.
6. Safe database transaction rollback.

---

## Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | **Starts both backend API and frontend client concurrently** |
| `npm run dev:server` | Starts Express backend in native Node.js `--watch` mode (`port 3001`) |
| `npm run dev:client` | Starts Vite protected development client (`port 5173`) |
| `npm run build` | Builds optimized client bundle into `client/dist/` (no source maps) |
| `npm run preview` | Previews the production client build locally |
| `npm start` | Runs the production Express server serving API + static frontend |
| `npm run db:migrate` | Applies all pending migrations from `server/migrations/` |
| `npm run db:seed-admin` | Bootstraps the administrator account defined in `.env` |
| `npm test` | Runs the integration and workflow test suite |
