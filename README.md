# Task Manager

A full-stack task management application built with Node.js, Next.js 14, and PostgreSQL. Clean, fast, keyboard-first.

---

## Features

- **Task CRUD** — create, edit, delete tasks with title, description, priority, due date, and status
- **Status workflow** — Todo → In Progress → Done with one-click toggle
- **Kanban board** — drag-and-drop tasks between columns with real-time API sync (dnd-kit)
- **List view** — paginated, sortable, filterable task list with status tabs
- **Stats bar** — live dashboard showing total, todo, in-progress, and overdue counts with a completion ring
- **Command palette** — `⌘K` global search over commands and tasks with keyboard navigation
- **Keyboard shortcuts** — `n`/`c` new task, `/` focus search, `?` shortcuts help, `Esc` close modal
- **File attachments** — upload files to individual tasks (multer, served statically)
- **Activity log** — every task change is recorded with before/after diff
- **Admin panel** — manage all users and their tasks
- **Dark mode** — system-aware with manual toggle persisted in localStorage
- **JWT auth** — stateless authentication, bcrypt password hashing
- **Security** — Helmet headers, rate limiting (100 req/15min general, 10 req/15min auth)
- **CI pipeline** — GitHub Actions running backend tests, frontend type-check, and build verification

---

## Architecture

```
┌─────────────────────────────────┐
│         Browser (Next.js 14)    │
│  App Router · Tailwind CSS      │
│  dnd-kit · axios · clsx         │
└──────────────┬──────────────────┘
               │ HTTP (REST)
               │ localhost:8080
┌──────────────▼──────────────────┐
│     Express.js API Server       │
│  Helmet · Rate Limit · JWT      │
│  express-validator · multer     │
└──────────────┬──────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────┐
│          PostgreSQL 15          │
│  Users · Tasks · ActivityLogs   │
│  Attachments                    │
└─────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | React Server Components, file-based routing, zero-config build |
| Styling | Tailwind CSS | Utility-first, consistent design tokens, no runtime overhead |
| Drag & drop | dnd-kit | Lightweight, accessible, works with React's concurrent mode |
| HTTP client | axios | Interceptors for auth token injection, better error handling than fetch |
| Backend | Express.js | Minimal, well-understood, large ecosystem |
| ORM | Prisma | Type-safe queries, great migration tooling, readable schema |
| Database | PostgreSQL | ACID, relational integrity, battle-tested |
| Auth | JWT + bcrypt | Stateless — no session store needed; bcrypt for safe password storage |
| Security | Helmet + express-rate-limit | Security headers and brute-force protection with near-zero config |
| CI | GitHub Actions | Free for public repos, YAML-native, integrates with PR checks |

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)

### Manual Setup

```bash
# 1. Clone
git clone <repo-url>
cd task-management

# 2. Backend
cd backend
cp .env.example .env        # fill DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npm run dev                 # http://localhost:8080

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev                 # http://localhost:3001
```

### Docker Setup

```bash
docker-compose up --build
# Frontend: http://localhost:3001
# Backend:  http://localhost:8080
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/taskdb` |
| `JWT_SECRET` | Secret key for JWT signing | `a-long-random-string` |
| `PORT` | Server port (default 8080) | `8080` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080` |

---

## API Reference

All task and admin routes require `Authorization: Bearer <token>` header.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user |

### Tasks

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tasks/stats` | Get task counts (total, todo, inProgress, done, overdue) |
| `GET` | `/api/tasks` | List tasks (supports `status`, `search`, `sortBy`, `sortOrder`, `page`, `limit`) |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks/:id` | Get single task with activity log |
| `PATCH` | `/api/tasks/:id` | Update task (partial) |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/tasks/:id/activity` | Get activity log for a task |

### Attachments

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tasks/:id/attachments` | Upload file to task |
| `DELETE` | `/api/tasks/:id/attachments/:attachmentId` | Remove attachment |

### Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users (admin only) |
| `GET` | `/api/admin/users/:id/tasks` | Get any user's tasks (admin only) |

---

## Design Decisions & Trade-offs

**Why JWT over sessions?** The app is stateless by design — no Redis or session store needed. The trade-off is tokens can't be revoked without a blocklist; acceptable for this scope.

**Why Prisma over raw SQL?** Type-safe queries prevent whole classes of bugs and migrations are version-controlled. The overhead is negligible for this scale.

**Why dnd-kit over react-beautiful-dnd?** react-beautiful-dnd is unmaintained and doesn't support React 18 strict mode well. dnd-kit is actively developed, smaller, and more flexible.

**Optimistic updates throughout** — status toggles and kanban drags update the UI immediately and revert on API error. This makes the app feel instant on any network.

**Stats endpoint vs. client aggregation** — stats are computed in a single DB round-trip with `Promise.all` over count queries rather than fetching all tasks and summing on the client. This scales to large task counts without pagination issues.

---

## If I Had More Time

- **Real-time collaboration** — WebSockets (Socket.io) so multiple users see updates live
- **Recurring tasks** — cron-style repeat rules (daily, weekly) with a background job runner
- **Sub-tasks & dependencies** — task hierarchy and blocking relationships
- **E2E tests** — Playwright tests covering auth flow, task CRUD, and kanban drag
- **Optimistic mutations with React Query** — replace manual optimistic state with `useMutation` + `onMutate` for cleaner code
- **Email notifications** — due-date reminders via a queue (BullMQ + nodemailer)
- **Proper token refresh** — sliding JWT expiry or refresh token rotation
- **Multi-tenant** — workspace/team concept so users can share task boards
