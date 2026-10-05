# TaskFlow — Production Deployment Architecture

## Architecture Overview

```
Browser (User)
    │  HTTPS
    ▼
┌─────────────────────────────┐
│        Vercel CDN            │
│    React + Vite SPA          │
│  (static, globally cached)   │
└────────────┬────────────────┘
             │  HTTPS API calls (Authorization: Bearer <token>)
             ▼
┌─────────────────────────────┐
│      Render Web Service      │
│   Laravel 12 PHP 8.2+ API    │
│  (php artisan serve / nginx) │
└──────┬──────────────┬────────┘
       │              │
       ▼              ▼
┌───────────┐  ┌──────────────────┐
│  Managed  │  │  Cloud Storage   │
│   MySQL   │  │  (AWS S3 / R2)   │
│ (Render/  │  │  Task Files &    │
│  Railway) │  │  Attachments     │
└───────────┘  └──────────────────┘
```

---

## Authentication Flow

```
1. User submits email + password → POST /api/login
2. Laravel verifies credentials with bcrypt
3. Laravel creates a Sanctum PersonalAccessToken
4. Token (plain text) is returned in JSON response
5. React stores token in localStorage
6. All subsequent API requests send:
      Authorization: Bearer <token>
7. Laravel validates token on every protected route via auth:sanctum middleware
8. On 401, React auto-redirects to /login?expired=1
```

**Token Storage:**  
Bearer token stored in `localStorage`. This is appropriate for this architecture because:
- There is no cookie-based session (no CSRF risk)
- The React app and Laravel API are on different domains (cross-site cookies would not work without complex SameSite configuration)

---

## Task Creation Flow

```
1. React user fills TaskForm → POST /api/tasks
2. Authorization: Bearer token validated
3. Gate::authorize('create', Task::class) checks role
4. StoreTaskRequest validates all fields
5. TaskService::createTask() creates the task record
6. Activity log entry created (action: 'created')
7. If assigned_to is set, notification created for assignee
8. Task returned as TaskResource JSON
9. React updates UI and shows toast notification
```

---

## File Upload / Attachment Flow

```
1. User selects file in FileUploader component
2. React sends multipart/form-data → POST /api/tasks/{id}/attachments
3. Bearer token validated, Gate::uploadAttachment checked
4. StoreAttachmentRequest validates MIME type and size (max 10 MB)
5. File stored via Storage::disk($disk)->put(...)
   - Local dev: storage/app/private/attachments/{task_id}/
   - Production: s3://your-bucket/attachments/{task_id}/
6. TaskAttachment record created with metadata (file_name, file_path, file_size, file_type)
   - Actual file lives in cloud storage
   - Only metadata lives in MySQL
7. Download URL returned as: GET /api/attachments/{id}/download
8. Download endpoint streams file from the configured disk
```

---

## Environment Variable Flow

```
Developer local:
  backend/.env  →  Laravel reads via env()
  frontend/.env →  Vite embeds VITE_* vars at build time

Production:
  Render dashboard  →  injected as OS environment variables → Laravel reads via env()
  Vercel dashboard  →  injected as VITE_* build vars     → baked into the JS bundle
```

---

## Database Schema Summary

| Table | Key Indexes |
|---|---|
| tasks | status, priority, due_date, project_id, assigned_to, created_by, parent_task_id |
| task_comments | task_id, user_id |
| task_activities | task_id, user_id, action |
| task_attachments | task_id, user_id |
| notifications | user_id, task_id, read_at |
| personal_access_tokens | tokenable_type+id |

---

## Security Architecture

| Layer | Mechanism |
|---|---|
| Authentication | Sanctum Bearer tokens |
| Authorization | Laravel Policies (TaskPolicy, ProjectPolicy, CommentPolicy, AttachmentPolicy) |
| Rate Limiting | 10/min for auth, 120/min for API |
| CORS | Origin whitelist via FRONTEND_URL env var |
| File Validation | MIME type + extension + 10 MB max |
| Password Hashing | bcrypt (12 rounds) |
| Mass Assignment | `$fillable` on all models |
| SQL Injection | Eloquent ORM parameterized queries |
| Stack Traces | Hidden in production (APP_DEBUG=false) |
| Trusted Proxies | Configured for Render load balancer |

---

## Deployment Providers

| Component | Provider | Free Tier Available |
|---|---|---|
| Frontend | Vercel | Yes |
| Backend API | Render | Yes (spins down after inactivity) |
| MySQL Database | Render / Railway / PlanetScale | Yes (limited) |
| File Storage | AWS S3 / Cloudflare R2 / Backblaze B2 | Yes (limited) |

---

## Production Considerations

### Render Free Tier
The free tier on Render **spins down** after 15 minutes of inactivity. First request after spin-down takes ~30 seconds. Upgrade to **Starter ($7/mo)** for always-on behavior.

### File Storage
Local disk storage on Render is **ephemeral** — files are lost on deploy/restart.  
You **must** configure `FILESYSTEM_DISK=s3` with real cloud storage credentials before going live.

### Queue Worker
This application uses `QUEUE_CONNECTION=database`. Background jobs run synchronously (via `sync` in tests). For production with heavy load, consider adding a separate Render Worker service running:
```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

### Scheduler
No scheduled tasks are required for core functionality. If you add due-date reminders, configure a Render cron job:
```
php artisan schedule:run
```
