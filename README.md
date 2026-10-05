# TaskFlow — Enterprise Task Tracking Tool

A production-ready, full-stack task tracking system built with **Laravel 12** (PHP 8.2+) and **React 18** (Vite + Tailwind CSS). Supports multi-user environments with role-based access control, real-time in-app notifications, file attachments, Kanban boards, subtasks, comments, and a rich analytics dashboard.

---

## Live Demo Credentials (Local / Seed Data)

| Role | Email | Password |
|:---|:---|:---|
| **Admin** | `admin@example.com` | `password123` |
| **Manager** | `manager1@example.com` | `password123` |
| **Manager** | `manager2@example.com` | `password123` |
| **Member** | `member1@example.com` | `password123` |
| **Member** | `member2@example.com` | `password123` |

> ⚠️ **Never use these credentials in production.** Seed data is for local development only.

---

## Architecture

```
Browser → Vercel (React SPA) → Render (Laravel API) → MySQL + S3 Storage
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full architecture diagram.

---

## Technology Stack

| Layer | Technology |
|:---|:---|
| Frontend | React 18, Vite 5, Tailwind CSS, React Router, Axios |
| Backend | Laravel 12, PHP 8.2+, Laravel Sanctum |
| Database | MySQL 8 / MariaDB 10.4+ |
| Auth | Sanctum Bearer Tokens |
| File Storage | AWS S3 / S3-compatible (Cloudflare R2, Backblaze B2) |
| Frontend Host | Vercel |
| Backend Host | Render |

---

## Features

- 🔐 Role-Based Access Control (Admin / Manager / Member)
- ✅ Full Task CRUD with status, priority, due dates
- 📋 Kanban Board with drag-and-drop status transitions
- 🗂️ Projects with task scoping
- 💬 Comments with author-only edit/delete
- 📎 File attachments (PDF, Word, Excel, images, ZIP — 10MB max)
- 🔖 Tags with color coding
- ✅ Subtasks with auto progress calculation
- 📊 Dashboard with overdue counts and live metrics
- 🔔 In-app notifications (assignment, status changes)
- 🔍 Search, filter, sort, and paginate tasks
- 📜 Activity audit timeline per task
- ⏱️ Time tracking per task

---

## Project Structure

```
taskassignment/
├── backend/              # Laravel 12 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Auth, Task, Project, Comment, Attachment, etc.
│   │   ├── Http/Requests/          # Validated Form Requests
│   │   ├── Http/Resources/         # JSON API Resources
│   │   ├── Models/                 # Eloquent Models
│   │   ├── Policies/               # Gate Policies (RBAC)
│   │   ├── Services/               # Business logic layer
│   │   └── Traits/                 # ApiResponseTrait
│   ├── database/
│   │   ├── migrations/             # Full schema migrations
│   │   └── seeders/                # Demo data seeder
│   ├── routes/api.php              # All API endpoints
│   ├── .env.example                # Environment variable template
│   └── render.yaml                 # Render deployment manifest
│
├── frontend/             # React 18 + Vite SPA
│   ├── src/
│   │   ├── api/                    # Axios client (centralized)
│   │   ├── components/             # UI components
│   │   ├── context/                # AuthContext, ToastContext
│   │   ├── hooks/                  # Custom hooks
│   │   ├── layouts/                # AppLayout, AuthLayout, Sidebar, Navbar
│   │   ├── pages/                  # Dashboard, Tasks, Projects, Kanban, etc.
│   │   └── services/               # API service modules
│   ├── .env.example                # Frontend env template
│   └── vercel.json                 # Vercel SPA config + security headers
│
└── docs/
    └── DEPLOYMENT.md               # Full deployment architecture guide
```

---

## Local Development

### Prerequisites

- PHP 8.2+ with extensions: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`
- Composer 2.x
- Node.js 18+ and npm
- MySQL 8 / MariaDB 10.4+ (e.g., XAMPP)

### 1. Clone the Repository

```bash
git clone https://github.com/latesh1/tasktrackingtool.git
cd tasktrackingtool
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

Backend runs at: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:8000/api
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|:---|:---|:---|
| `APP_KEY` | Laravel encryption key (auto-generate with `php artisan key:generate`) | `base64:abc...` |
| `APP_URL` | Backend public URL | `https://taskflow-api.onrender.com` |
| `APP_DEBUG` | Must be `false` in production | `false` |
| `FRONTEND_URL` | React app URL (used for CORS) | `https://yourapp.vercel.app` |
| `SANCTUM_STATEFUL_DOMAINS` | Domain only (no protocol) for Sanctum | `yourapp.vercel.app` |
| `DB_HOST` | MySQL host | `your-db.render.com` |
| `DB_DATABASE` | Database name | `taskflow_prod` |
| `DB_USERNAME` | Database user | `taskflow_user` |
| `DB_PASSWORD` | Database password | *(set in dashboard)* |
| `FILESYSTEM_DISK` | Storage driver | `s3` |
| `AWS_ACCESS_KEY_ID` | S3 key | *(set in dashboard)* |
| `AWS_SECRET_ACCESS_KEY` | S3 secret | *(set in dashboard)* |
| `AWS_BUCKET` | S3 bucket name | `taskflow-attachments` |
| `AWS_DEFAULT_REGION` | S3 region | `us-east-1` |
| `LOG_CHANNEL` | Log channel (use `stderr` on Render) | `stderr` |
| `LOG_LEVEL` | Minimum log level | `error` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|:---|:---|:---|
| `VITE_API_URL` | Full API base URL **including /api** | `https://taskflow-api.onrender.com/api` |

> ⚠️ All `VITE_*` variables are **embedded in the browser bundle**. Never store secrets here.

---

## Production Deployment

### 1. MySQL Database

Use one of:
- [Render PostgreSQL/MySQL](https://render.com/docs/databases) (simplest — same platform)
- [Railway](https://railway.app)
- [PlanetScale](https://planetscale.com) (serverless MySQL)

Create a database and note the host, port, name, user, and password.

### 2. File Storage (S3)

Use one of:
- [AWS S3](https://aws.amazon.com/s3/)
- [Cloudflare R2](https://cloudflare.com/products/r2/) (zero egress fees)
- [Backblaze B2](https://www.backblaze.com/b2/)

Create a bucket, generate an access key, and note the credentials.

For R2/Backblaze, also set `AWS_ENDPOINT` to the provider's S3-compatible endpoint.

### 3. Backend on Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo: `latesh1/tasktrackingtool`
3. **Root Directory**: `backend`
4. **Build Command**:
   ```bash
   composer install --no-dev --optimize-autoloader --no-interaction && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate --force
   ```
5. **Start Command**:
   ```bash
   php artisan serve --host=0.0.0.0 --port=$PORT
   ```
6. **Health Check Path**: `/api/health`
7. Add **Environment Variables** in the Render dashboard:

| Key | Value |
|:---|:---|
| `APP_KEY` | *(auto-generate or run `php artisan key:generate --show`)* |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://your-service.onrender.com` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `SANCTUM_STATEFUL_DOMAINS` | `your-frontend.vercel.app` |
| `DB_HOST` | *(from your MySQL provider)* |
| `DB_PORT` | `3306` |
| `DB_DATABASE` | *(your DB name)* |
| `DB_USERNAME` | *(your DB user)* |
| `DB_PASSWORD` | *(your DB password)* |
| `FILESYSTEM_DISK` | `s3` |
| `AWS_ACCESS_KEY_ID` | *(your S3 key)* |
| `AWS_SECRET_ACCESS_KEY` | *(your S3 secret)* |
| `AWS_DEFAULT_REGION` | `us-east-1` |
| `AWS_BUCKET` | *(your bucket name)* |
| `LOG_CHANNEL` | `stderr` |
| `LOG_LEVEL` | `error` |
| `SESSION_DRIVER` | `database` |
| `CACHE_STORE` | `database` |

### 4. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `latesh1/tasktrackingtool`
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Add **Environment Variable** in Vercel Settings → Environment Variables:

| Key | Value |
|:---|:---|
| `VITE_API_URL` | `https://your-service.onrender.com/api` |

8. Deploy. Vercel auto-configures SPA routing from `vercel.json`.

---

## API Endpoints

### Authentication
```
POST   /api/register              Register new user
POST   /api/login                 Login (returns Bearer token)
POST   /api/logout                Logout (requires auth)
GET    /api/user                  Get current user (requires auth)
GET    /api/users                 List users for assignments (requires auth)
```

### Tasks
```
GET    /api/tasks                 List tasks (paginated, filterable)
POST   /api/tasks                 Create task
GET    /api/tasks/{id}            Get task with full details
PUT    /api/tasks/{id}            Update task
DELETE /api/tasks/{id}            Delete task
PATCH  /api/tasks/{id}/status     Update status only
POST   /api/tasks/{id}/assign     Assign/reassign task
POST   /api/tasks/bulk            Bulk status update / delete
GET    /api/tasks/overdue         Overdue tasks list
GET    /api/tasks/{id}/subtasks   List subtasks with progress
POST   /api/tasks/{id}/subtasks   Add subtask
GET    /api/tasks/{id}/activities Activity audit log
```

### Comments
```
GET    /api/tasks/{id}/comments   List comments
POST   /api/tasks/{id}/comments   Add comment
PUT    /api/comments/{id}         Edit comment (author only)
DELETE /api/comments/{id}         Delete comment (author or manager)
```

### Attachments
```
GET    /api/tasks/{id}/attachments          List attachments
POST   /api/tasks/{id}/attachments          Upload file (max 10MB)
GET    /api/attachments/{id}/download       Download file
DELETE /api/attachments/{id}                Delete attachment
```

### Projects
```
GET    /api/projects              List projects
POST   /api/projects              Create project
GET    /api/projects/{id}         Get project
PUT    /api/projects/{id}         Update project
DELETE /api/projects/{id}         Delete project
GET    /api/projects/{id}/tasks   Project-scoped tasks
```

### Tags, Notifications, Dashboard
```
GET|POST /api/tags                List or create tags
GET    /api/dashboard             Dashboard metrics (counts, overdue, recent)
GET    /api/notifications         User notifications
PATCH  /api/notifications/read-all              Mark all read
PATCH  /api/notifications/{id}/read             Mark one read
GET    /api/health                Health check (no auth required)
```

### Rate Limits
| Endpoint group | Limit |
|:---|:---|
| `/api/login`, `/api/register` | 10 requests / minute / IP |
| All other API endpoints | 120 requests / minute / user or IP |

---

## Running Tests

```bash
cd backend
php artisan test
# Expected: 9 tests, 42 assertions, all passing
```

---

## Production Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_KEY` set (never empty)
- [ ] Database credentials set in dashboard (not committed)
- [ ] S3 credentials set in dashboard (not committed)
- [ ] `FRONTEND_URL` matches actual Vercel URL
- [ ] `VITE_API_URL` matches actual Render URL
- [ ] `php artisan migrate --force` run (NOT migrate:fresh)
- [ ] Health check endpoint `/api/health` responds 200
- [ ] File upload tested with real S3 bucket
- [ ] Login works from production frontend domain
- [ ] All roles (admin/manager/member) tested
- [ ] CORS: only the Vercel domain is allowed

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Bearer tokens scoped per user, revoked on logout
- All resource access checked with Laravel Policies
- File uploads validated by MIME type + extension + size
- No stack traces exposed to API consumers in production
- CORS allows only configured `FRONTEND_URL`
- Rate limiting on auth endpoints prevents brute-force
- Trusted proxies configured for Render load balancer
- No secrets in `VITE_*` variables (browser-visible)
