# TaskFlow - Enterprise Production-Ready Task Tracking Tool

A scalable, production-grade Task Tracking System built with **Laravel 12 (PHP 8.2+)**, **Laravel Sanctum**, **MySQL**, and a modern **React 18+ (Vite, Tailwind CSS, React Router, Axios)** dashboard.

Designed as an autonomous, modular system with clean architecture that can run stand-alone or seamlessly integrate into a larger enterprise Project Management Portal.

---

## 🚀 Key Features

### Backend Architecture (Laravel 12 & Sanctum)
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for `admin`, `manager`, and `member` roles using Laravel Policies and Gates.
- **RESTful API Architecture**: Strict REST standards with consistent JSON responses via `ApiResponseTrait`.
- **Form Request Validation**: Dedicated Form Request classes for every mutating action with comprehensive validation rules.
- **Eloquent ORM & API Resources**: Consistent serialization, eager-loading to prevent N+1 queries, and clean separation of concerns.
- **Auditing & Activity Tracking**: Automated logging of state transitions, status changes, assignments, and priority shifts.
- **Subtask Hierarchy & Auto-Progress**: Tasks calculate subtask completion percentages automatically.
- **Attachment Management**: Multi-format secure file uploads (PDF, DOCX, PNG, JPG, ZIP) with size validation and download endpoints.
- **Notification Engine**: In-app notifications triggered on task assignment, status updates, and mentions.
- **Time Tracking**: Logged time tracking per task with duration, user attribution, and dates.
- **Automated Test Suite**: Comprehensive Pest / PHPUnit Feature & Unit tests covering authentication, authorization, CRUD, status flows, and subtasks.

### Frontend Dashboard (React 18+, Vite, Tailwind CSS)
- **Modern Dashboard UI**: Clean aesthetics, glassmorphism touches, subtle shadows, and status badges.
- **Authentication Flow**: Sanctum Bearer token persistence, automatic session expiration handling, and protected route wrappers.
- **Comprehensive Task Board & Table Views**: Filter by status, priority, project, and assignee; search by keyword; sort dynamically.
- **Interactive Task Details**:
  - In-place status & priority transitions
  - Reassignment dropdown with user avatars
  - Subtask checklist with live progress bar
  - Activity audit timeline with user stamps
  - Discussion / Comments section with edit & delete controls
  - Drag-and-drop file upload zone with file previews & downloads
- **Project Workspaces**: Project overview cards, task progress counters, and project CRUD modal.
- **In-App Notifications**: Real-time popover dropdown with unread indicators and "Mark all as read" capability.
- **Toast Notifications & Confirmation Modals**: Non-blocking feedback and confirmation dialogs for destructive actions.

---

## 📂 Project Structure

```text
taskassignment/
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # Auth, Task, Project, Tag, Comment, Attachment, Notification, Dashboard
│   │   │   ├── Requests/          # StoreTaskRequest, UpdateTaskRequest, LoginRequest, etc.
│   │   │   └── Resources/         # TaskResource, ProjectResource, UserResource, etc.
│   │   ├── Models/                # User, Task, Project, Tag, TaskComment, TaskAttachment, TaskActivity, Notification
│   │   ├── Policies/              # TaskPolicy, ProjectPolicy, CommentPolicy
│   │   ├── Services/              # TaskService, DashboardService, NotificationService, ActivityService
│   │   └── Traits/                # ApiResponseTrait
│   ├── config/                    # cors.php, sanctum.php, database.php
│   ├── database/
│   │   ├── migrations/            # Complete schema with foreign key cascades & indexes
│   │   └── seeders/               # DatabaseSeeder with realistic projects, users, tasks, tags, comments
│   ├── routes/
│   │   └── api.php                # Complete versioned RESTful endpoints
│   └── tests/
│       └── Feature/               # TaskApiTest.php (All 9 tests passing)
│
├── frontend/
│   ├── src/
│   │   ├── api/                   # axios.js instance with interceptors
│   │   ├── components/            # TaskTable, TaskCard, TaskForm, ActivityTimeline, CommentSection, etc.
│   │   ├── context/               # AuthContext.jsx with login, logout, user state
│   │   ├── hooks/                 # useForm.js, custom utility hooks
│   │   ├── layouts/               # AppLayout, AuthLayout, Sidebar, Navbar
│   │   ├── pages/                 # DashboardPage, TasksPage, TaskDetailPage, ProjectsPage, LoginPage, RegisterPage
│   │   ├── services/              # taskService, projectService, authService, dashboardService, etc.
│   │   └── utils/                 # helpers.js (formatDate, timeAgo, priorityColor, statusColor)
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 👥 Seed Credentials & Roles

| Name | Email | Password | Role | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Sarah Admin** | `admin@example.com` | `password123` | **Admin** | Full system access: delete/edit any task, project, user |
| **Alex Rivera** | `manager1@example.com` | `password123` | **Manager** | Create projects, assign tasks, manage team tasks |
| **Marcus Chen** | `manager2@example.com` | `password123` | **Manager** | Manage assigned projects and oversee team velocity |
| **Emily Watson** | `member1@example.com` | `password123` | **Member** | Update assigned task status, post comments, log subtasks |
| **David Kim** | `member2@example.com` | `password123` | **Member** | View tasks, change status of assigned tasks |

---

## 🛠️ Getting Started

### 1. Prerequisites
- **PHP 8.2+** with extensions: `pdo_mysql`, `fileinfo`, `mbstring`, `openssl`
- **Composer 2.x**
- **Node.js 18+** & **npm**
- **MySQL / MariaDB** (e.g., via XAMPP or native service)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Copy environment template if needed
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations and seed data
php artisan migrate:fresh --seed

# Create storage symlink for uploaded files
php artisan storage:link

# Start the Laravel development server
php artisan serve
```
Backend will be live at `http://localhost:8000`.

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🧪 Testing

### Backend Automated Tests
Run the PHPUnit/Pest test suite to verify authorization rules, endpoints, and task logic:
```bash
cd backend
php artisan test
```

### Frontend Build Validation
Verify that all components and assets compile cleanly for production:
```bash
cd frontend
npm run build
```

---

## 🔌 API Endpoints Summary

### Authentication (`/api`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate and obtain Sanctum Bearer token
- `POST /logout` - Revoke current access token
- `GET /user` - Get current authenticated user profile
- `GET /users` - List users for task assignment

### Dashboard (`/api/dashboard`)
- `GET /dashboard` - Aggregated status counts, overdue metrics, recently updated tasks

### Tasks (`/api/tasks`)
- `GET /tasks` - List tasks with pagination, filtering (`status`, `priority`, `project_id`, `assigned_to`, `search`)
- `POST /tasks` - Create a new task (Manager / Admin or Project member)
- `GET /tasks/{task}` - Retrieve single task with subtasks, tags, attachments, comments
- `PUT /tasks/{task}` - Update task details
- `DELETE /tasks/{task}` - Delete task (Admin / Manager only)
- `PATCH /tasks/{task}/status` - Quick status transition (`todo`, `in_progress`, `blocked`, `done`)
- `POST /tasks/{task}/assign` - Reassign task to a team member
- `POST /tasks/bulk` - Batch status update or deletion
- `GET /tasks/{task}/subtasks` - List subtasks
- `POST /tasks/{task}/subtasks` - Add a subtask
- `GET /tasks/{task}/activities` - Retrieve activity audit log

### Comments & Attachments
- `GET /tasks/{task}/comments` & `POST /tasks/{task}/comments`
- `PUT /comments/{comment}` & `DELETE /comments/{comment}`
- `POST /tasks/{task}/attachments` - Multipart file upload
- `GET /attachments/{attachment}/download` - Stream / download file
- `DELETE /attachments/{attachment}` - Remove attachment

### Projects & Tags
- `GET /projects`, `POST /projects`, `GET /projects/{project}`, `PUT /projects/{project}`
- `GET /projects/{project}/tasks` - Project-scoped task list
- `GET /tags`, `POST /tags`

### Notifications
- `GET /notifications` - List user notifications
- `PATCH /notifications/{id}/read` - Mark single notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read

---

## 🏢 Integration with Larger Project Management Portals
1. **Modular Domain Models**: Tasks, Projects, and Activities are bounded contexts.
2. **Decoupled API Contract**: Resources (`TaskResource`, `ProjectResource`) format responses independently from database tables.
3. **Pluggable Auth**: Supports standard Sanctum tokens or OAuth2/SSO with minimal config change in `config/auth.php`.
4. **Independent Frontend Modules**: Pages and components are structured to be embedded into micro-frontends or imported as a dedicated route module.
