# NextGen Consulting — Frontend

React 18 + TypeScript frontend for the NextGen Consulting platform.

## Stack

- **React 18** + TypeScript (strict)
- **Vite** — dev server with proxy to backend
- **React Router v6** — lazy-loaded pages
- **TanStack Query v5** — server state, polling
- **Zustand** — auth store (accessToken in memory)
- **Axios** — JWT interceptors + refresh queue
- **React Hook Form + Zod** — form validation
- **Tailwind CSS v3** — styling
- **Recharts** — charts in dashboards
- **React Hot Toast** — notifications

## Quick start

```bash
# From the frontend directory
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**  
Backend must be running at **http://localhost:8080**

API requests are proxied automatically via Vite (`/api` → `http://localhost:8080/api`).

## Auth notes

- Login uses **phone** (e.g. `+7 777 000 00 00`) + password — not email
- Password requirements: min 6 chars, must include uppercase, lowercase, digit, special char (`@$!%.*?&`)
- `accessToken` is stored **only in memory** (Zustand), never localStorage
- `refreshToken` is stored in **localStorage**
- On app start: if refreshToken exists → auto-refresh → fetch profile

## Request statuses

Backend statuses (different from the UI mockup names):

| Backend value | Displayed as |
|---|---|
| `PENDING` | Pending |
| `PROGRESS` | In Progress |
| `COMPLETED` | Completed |
| `REJECTED` | Rejected |

## Route structure

| Path | Role | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/consultants` | Public | Browse consultants |
| `/dashboard` | CLIENT | Client dashboard |
| `/requests` | CLIENT | My requests list |
| `/requests/new` | CLIENT | Submit request |
| `/requests/:id` | CLIENT | Request detail |
| `/notifications` | CLIENT | Notifications |
| `/profile` | CLIENT | Edit profile |
| `/consultant/dashboard` | CONSULTANT | Consultant workspace |
| `/consultant/requests` | CONSULTANT | Assigned requests |
| `/consultant/requests/:id` | CONSULTANT | Request + status update |
| `/consultant/profile` | CONSULTANT | Edit consultant profile |
| `/consultant/links` | CONSULTANT | Contact links CRUD |
| `/consultant/achievements` | CONSULTANT | My achievements |
| `/admin/dashboard` | ADMIN | Platform overview |
| `/admin/users` | ADMIN | User management |
| `/admin/users/:id` | ADMIN | User detail + role |
| `/admin/consultants` | ADMIN | Consultant management |
| `/admin/requests` | ADMIN | All requests |
| `/admin/achievements` | ADMIN | Award achievements |
| `/admin/audit` | ADMIN | Audit log |

## Build

```bash
npm run build   # outputs to dist/
```
