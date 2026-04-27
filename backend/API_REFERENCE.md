# KaryaDesk API - Quick Reference (Post-Security Update)

## Authentication Endpoints

All authentication endpoints remain unchanged:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout (requires auth)
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `GET /api/v1/auth/verify-email?token=...` - Verify email
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `GET /api/v1/auth/profile` - Get current user (requires auth)
- `POST /api/v1/auth/change-password` - Change password (requires auth)

## Project Endpoints

### Projects

- `POST /api/v1/projects` - Create project (requires auth)
- `GET /api/v1/projects?page=1&limit=10` - Get user's projects (requires auth, **paginated**)
- `GET /api/v1/projects/:projectId` - Get project by id (requires auth)
- `PATCH /api/v1/projects/:projectId` - Update project (requires MANAGEMENT role)
- `DELETE /api/v1/projects/:projectId` - Delete project (requires OWNER role only)

### Project Dashboard

- `GET /api/v1/projects/:projectId/dashboard/summary` - Get dashboard summary (requires VIEWER role)

### User Dashboard

- `GET /api/v1/dashboard/me` - Get authenticated user dashboard aggregate (requires auth)

User dashboard response data includes:

- `tasks` - `assigned`, `inProgress`, `submitted`, `upcoming`, `overdue`, `recent`, `completed`
- `mentions` - notes where current user is mentioned (across all authorized projects)
- `stats` - `totalAssigned`, `totalCompleted`, `totalPending`, `totalOverdue`
- `activity` - latest user-relevant task activity (`task_submitted`, `task_approved`, `task_rejected`, `task_assigned`)
- `suggestions` - simple actionable summary strings

Dashboard response data includes:

- `kpi` - `totalTasks`, `completedTasks`, `completionRate`, `overdueTasks`, `totalCreditsEarned`
- `statusDistribution` - grouped task counts by status
- `recentActivity` - latest verified contributions (max 10), populated with user and task

### Project Members

- `GET /api/v1/projects/:projectId/members` - Get project members (requires VIEWER role)
- `POST /api/v1/projects/:projectId/members` - Add member (requires MANAGEMENT role)
- `PATCH /api/v1/projects/:projectId/members/:memberId` - Update member role (requires MANAGEMENT role)
- `DELETE /api/v1/projects/:projectId/members/:memberId` - Remove member (requires MANAGEMENT role)

### Tasks

- `GET /api/v1/projects/:projectId/tasks?page=1&limit=10` - Get project tasks (requires VIEWER role, **paginated**)
- `POST /api/v1/projects/:projectId/tasks` - Create task (requires MANAGEMENT role)
- `PATCH /api/v1/projects/:projectId/tasks/:taskId` - Update task (requires MANAGEMENT role)
- `DELETE /api/v1/projects/:projectId/tasks/:taskId` - Delete task (requires MANAGEMENT role)
- `PATCH /api/v1/projects/:projectId/tasks/:taskId/submit` - Submit task for review (requires EDITOR role)
- `PATCH /api/v1/projects/:projectId/tasks/:taskId/verify` - Verify task submission (requires MANAGEMENT role)

### Leaderboard

- `GET /api/v1/projects/:projectId/leaderboard` - Get project leaderboard (requires VIEWER role)
- `GET /api/v1/leaderboard/global` - Get global leaderboard (requires auth)

### Notes

- `GET /api/v1/projects/:projectId/notes` - Get project notes (requires VIEWER role)
- `POST /api/v1/projects/:projectId/notes` - Create note (requires MANAGEMENT role)
- `GET /api/v1/projects/:projectId/notes/:noteId` - Get single note (requires VIEWER role)
- `PATCH /api/v1/projects/:projectId/notes/:noteId` - Update note (requires MANAGEMENT role)
- `DELETE /api/v1/projects/:projectId/notes/:noteId` - Delete note (requires MANAGEMENT role)
- `GET /api/v1/projects/:projectId/notes/mentions/me` - Get mentions (requires VIEWER role)

### Comments (**UPDATED PATHS**)

- `POST /api/v1/comments/:projectId/tasks/:taskId` - Create comment (requires VIEWER role)
- `GET /api/v1/comments/:projectId/tasks/:taskId` - Get task comments (requires VIEWER role)
- `PATCH /api/v1/comments/:projectId/edit/:commentId` - Update comment (requires VIEWER role, own comment only)
- `DELETE /api/v1/comments/:projectId/edit/:commentId` - Delete comment (requires VIEWER role, own comment or project creator)

### SubTasks (**UPDATED PATHS**)

- `POST /api/v1/subtasks/:projectId/tasks/:taskId` - Create subtask (requires EDITOR role)
- `GET /api/v1/subtasks/:projectId/tasks/:taskId?page=1&limit=10` - Get task subtasks (requires VIEWER role, paginated)
- `PATCH /api/v1/subtasks/:projectId/:SubTaskId` - Update subtask (requires EDITOR role)
- `DELETE /api/v1/subtasks/:projectId/:SubTaskId` - Delete subtask (requires EDITOR role)

## System Endpoints

- `GET /api/v1/healthcheck` - Service health check (public)

## Role Hierarchy

### Global Roles

- `user` - Default role for all registered users
- `admin` - Administrative access
- `superadmin` - Full system access, bypasses all project permissions

### Project Roles (in order of permissions)

1. **OWNER** - Full control, can delete project
2. **PROJECT_ADMIN** - Manage members, tasks, cannot delete project
3. **MEMBER** - Create/edit tasks, comments, subtasks
4. **VIEWER** - Read-only access

### Role Groups (used in middleware)

- `PROJECT_ROLES.ALL` - All roles
- `PROJECT_ROLES.MANAGEMENT` - [owner, project_admin]
- `PROJECT_ROLES.EDITORS` - [owner, project_admin, member]
- `PROJECT_ROLES.VIEWERS` - [owner, project_admin, member, viewer]

## Pagination Format

All paginated endpoints now return:

```json
{
  "statuscode": 200,
  "success": true,
  "message": "...",
  "data": {
    "projects": [...] // or tasks, etc.
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

Query parameters:

- `page` - Page number (default: 1, min: 1)
- `limit` - Items per page (default: 10, max: 100)

## Authentication

### Headers

```
Authorization: Bearer <access_token>
```

### Cookies (preferred)

- `accessToken` - Short-lived (15 minutes)
- `refreshToken` - Long-lived (7 days)

Cookies are httpOnly, secure (in production), and sameSite: strict.

## Error Response Format

```json
{
  "success": false,
  "statuscode": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

In development, stack traces are included. In production, they are omitted.

## Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate entry)
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

## Security Notes

1. **Token Refresh:** Refresh tokens rotate on each use. Reuse is detected and blocked.
2. **Project Access:** All project endpoints verify membership before proceeding.
3. **Role Enforcement:** Operations are restricted based on user's role in the project.
4. **Input Validation:** All ObjectIds are validated before database queries.
5. **CORS:** Only whitelisted origins can make requests.
6. **Rate Limiting:** (To be implemented) Recommended for auth endpoints.

## Environment Variables Required

```bash
# Database
MONGO_URI=mongodb://...

# JWT Secrets (minimum 32 characters each)
ACCESS_TOKEN_SECRET=your-secret-here
REFRESH_TOKEN_SECRET=your-secret-here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Server
PORT=8000
NODE_ENV=development

# URLs for CORS
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:8000

# Email (optional, for email features)
MAILTRAP_SMTP_HOST=...
MAILTRAP_SMTP_PORT=...
MAILTRAP_SMTP_USER=...
MAILTRAP_SMTP_PASS=...
```
