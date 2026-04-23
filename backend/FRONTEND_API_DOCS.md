# Projectify API Documentation for Frontend Team

## Base URL

```
Development: http://localhost:8000/api/v1
Production: [Your production URL]/api/v1
```

## Table of Contents

- [Authentication](#authentication)
- [Projects](#projects)
- [Project Dashboard](#project-dashboard)
- [User Dashboard](#user-dashboard)
- [Project Members](#project-members)
- [Users](#users)
- [Invites](#invites)
- [Tasks](#tasks)
- [Leaderboard](#leaderboard)
- [Comments](#comments)
- [SubTasks](#subtasks)
- [Notes](#notes)
- [Health Check](#health-check)
- [Common Patterns](#common-patterns)

---

## Authentication

All authenticated endpoints require either:

- **Cookie**: `accessToken` (automatically sent by browser)
- **Header**: `Authorization: Bearer <accessToken>`

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!"
}
```

**Response (201):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "✅ user registered successfully, check your email for verification",
  "data": null
}
```

### Verify Email

```http
POST /auth/verify-email?token=<verification_token>
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "✅ Email verified successfully",
  "data": null
}
```

### Resend Email Verification

```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Verification email resent. Please check your inbox.",
  "data": null
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "676a...",
      "username": "johndoe",
      "isEmailVerified": true
    }
  }
}
```

**Note:** Sets `accessToken` and `refreshToken` cookies automatically.

### Logout

```http
POST /auth/logout
Authorization: Bearer <accessToken>
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "logged out successfully",
  "data": null
}
```

### Refresh Access Token

```http
POST /auth/refresh-token
Cookie: refreshToken=<token>
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Access token refreshed successfully",
  "data": null
}
```

**Note:** Returns new `accessToken` and `refreshToken` cookies.

### Get Current User Profile

```http
GET /auth/profile
Authorization: Bearer <accessToken>
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "_id": "676a...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "john doe",
    "role": "user",
    "avatar": {
      "url": "https://...",
      "localPath": ""
    },
    "isEmailVerified": true,
    "createdAt": "2024-12-24T...",
    "updatedAt": "2024-12-24T..."
  }
}
```

### Change Password

```http
POST /auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "user password changed successfully",
  "data": null
}
```

### Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Reset password email sent successfully",
  "data": null
}
```

### Reset Password

```http
POST /auth/reset-password?token=<reset_token>
Content-Type: application/json

{
  "newPassword": "NewPass123!"
}
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Password has been reset successfully. Please login with new password.",
  "data": null
}
```

### Update Profile

```http
PATCH /auth/update-profile
Authorization: Bearer
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "username": "johndoe_new"
}
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "676a...",
    "username": "johndoe_new",
    "email": "john@example.com",
    "fullName": "John Doe Updated",
    "role": "user",
    "avatar": { "url": "https://..." },
    "isEmailVerified": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Update Avatar

```http
PATCH /auth/update-avatar
Authorization: Bearer
Content-Type: multipart/form-data

avatar=
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "_id": "676a...",
    "avatar": {
      "url": "https://cloudinary.com/...",
      "localPath": ""
    }
  }
}
```

---

## Projects

### Create Project

```http
POST /projects
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "My New Project",
  "description": "Project description here",
  "endDate": "2025-12-31T23:59:59.000Z",
  "githubRepo": "https://github.com/user/repo",
  "tags": ["react", "nodejs"]
}
```

**Response (201):**

```json
{
  "statuscode": 201,
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "676a...",
    "name": "My New Project",
    "description": "Project description here",
    "createdBy": "676a...",
    "endDate": "2025-12-31T23:59:59.000Z",
    "githubRepo": "https://github.com/user/repo",
    "tags": ["react", "nodejs"],
    "createdAt": "2024-12-24T...",
    "updatedAt": "2024-12-24T..."
  }
}
```

**Note:** Creator is automatically added as project member with `owner` role.

### Get All Projects (Paginated)

```http
GET /projects?page=1&limit=10
Authorization: Bearer <accessToken>
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Projects fetched successfully",
  "data": {
    "projects": [
      {
        "_id": "676a...",
        "name": "My Project",
        "description": "Description",
        "createdBy": "676a...",
        "endDate": "2025-12-31T23:59:59.000Z",
        "githubRepo": "https://...",
        "tags": ["react"],
        "createdAt": "2024-12-24T...",
        "updatedAt": "2024-12-24T..."
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### Get Project By ID

```http
GET /projects/:projectId
Authorization: Bearer <accessToken>
```

**Required Role:** Authenticated user

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Project fetched successfully",
  "data": {
    "_id": "676a...",
    "name": "My Project",
    "description": "Project description",
    "createdBy": {
      "_id": "676a...",
      "username": "johndoe",
      "avatar": { "url": "https://...", "localPath": "" }
    },
    "endDate": "2025-12-31T23:59:59.000Z",
    "githubRepo": "https://github.com/user/repo",
    "tags": ["react", "nodejs"],
    "createdAt": "2024-12-24T...",
    "updatedAt": "2024-12-24T..."
  }
}
```

**Frontend Notes:**

- Use this endpoint for project-level page bootstrap before members/tasks widgets load.
- If the `projectId` is invalid, backend responds with `400`.
- If project does not exist or user is unauthorized, handle `404` or `403` gracefully in UI routing.

### Update Project

```http
PATCH /projects/:projectId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "endDate": "2025-12-31T23:59:59.000Z",
  "githubRepo": "https://github.com/user/new-repo",
  "tags": ["react", "typescript"]
}
```

**Required Role:** `project_admin` or `owner`

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "_id": "676a...",
    "name": "Updated Project Name"
    // ... other fields
  }
}
```

### Delete Project

```http
DELETE /projects/:projectId
Authorization: Bearer <accessToken>
```

**Required Role:** `owner` only

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Project deleted successfully",
  "data": null
}
```

**Note:** Cascades deletion to all project members, tasks, comments, subtasks, and notes.

---

## Project Dashboard

### Get Project Dashboard Summary

```http
GET /projects/:projectId/dashboard/summary
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Dashboard summary fetched successfully",
  "data": {
    "kpi": {
      "totalTasks": 50,
      "completedTasks": 20,
      "completionRate": 40,
      "overdueTasks": 5,
      "totalCreditsEarned": 1250
    },
    "statusDistribution": [
      { "status": "todo", "count": 10 },
      { "status": "in_progress", "count": 15 },
      { "status": "submitted", "count": 5 },
      { "status": "done", "count": 20 }
    ],
    "recentActivity": [
      {
        "type": "contribution_approved",
        "taskTitle": "Fix Login Bug",
        "user": {
          "username": "john_doe",
          "avatar": {
            "url": "https://...",
            "localPath": ""
          }
        },
        "timestamp": "2024-12-24T10:00:00.000Z"
      }
    ]
  }
}
```

**Frontend Notes:**

- `completionRate` is a whole-number percentage (`0-100`).
- `statusDistribution` always includes `todo`, `in_progress`, `submitted`, and `done` with `0` fallback values.
- `recentActivity` is sorted by latest contribution verification time and returns a maximum of 10 items.
- When no tasks or contributions exist yet, KPI values are normalized to `0` and `recentActivity` is an empty array.

### TypeScript Interfaces (Frontend Ready)

```ts
type Avatar = {
  url?: string;
  public_id?: string;
  localPath?: string;
};

type DashboardKpi = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  totalCreditsEarned: number;
};

type DashboardStatusDistribution = {
  status: "todo" | "in_progress" | "submitted" | "done";
  count: number;
};

type DashboardRecentActivityItem = {
  type: string;
  taskTitle: string;
  user: {
    username: string;
    avatar: Avatar;
  };
  timestamp: string | null;
};

type DashboardSummaryData = {
  kpi: DashboardKpi;
  statusDistribution: DashboardStatusDistribution[];
  recentActivity: DashboardRecentActivityItem[];
};

type ApiResponse<T> = {
  statuscode: number;
  success: boolean;
  message: string;
  data: T;
};
```

### TypeScript API Helper (Axios)

```ts
import axios from "axios";

export const getProjectDashboardSummary = (projectId: string) =>
  axios
    .get<
      ApiResponse<DashboardSummaryData>
    >(`/projects/${projectId}/dashboard/summary`)
    .then((res) => res.data.data);
```

---

## User Dashboard

### Get My Dashboard (Aggregated)

```http
GET /dashboard/me
Authorization: Bearer <accessToken>
```

**Required Role:** Authenticated user

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "User dashboard fetched successfully",
  "data": {
    "tasks": {
      "assigned": [],
      "inProgress": [],
      "submitted": [],
      "upcoming": [],
      "overdue": [],
      "recent": [],
      "completed": []
    },
    "mentions": [],
    "stats": {
      "totalAssigned": 0,
      "totalCompleted": 0,
      "totalPending": 0,
      "totalOverdue": 0
    },
    "activity": [],
    "suggestions": ["No urgent items right now. Keep your momentum going."]
  }
}
```

**Frontend Notes:**

- `tasks.upcoming` contains non-done tasks due in the next 5 days, sorted by nearest due date.
- `tasks.overdue` contains non-done tasks with dueDate before now.
- `tasks.recent` returns the latest 10 assignments for the current user.
- `tasks.completed` returns the latest 10 completed tasks.
- `activity` is already merged and sorted latest-first, max 10 items.
- `mentions` is aggregated across all projects the user is still a member of.

### TypeScript Interfaces (Frontend Ready)

```ts
type Avatar = {
  url?: string;
  public_id?: string;
  localPath?: string;
};

type DashboardTaskStatus = "todo" | "in_progress" | "submitted" | "done";

type DashboardTaskItem = {
  _id: string;
  title: string;
  status: DashboardTaskStatus;
  priority: "low" | "medium" | "high" | "critical";
  difficulty: "easy" | "medium" | "hard" | "expert";
  credits: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  project: {
    _id: string;
    name: string;
  };
};

type UserDashboardNoteMention = {
  _id: string;
  content: string;
  createdAt: string;
  project: {
    _id: string;
    name: string;
  };
  creator: {
    _id: string;
    username: string;
    avatar: Avatar;
  };
};

type UserDashboardActivity = {
  type: "task_submitted" | "task_approved" | "task_rejected" | "task_assigned";
  taskId: string;
  taskTitle: string;
  project: {
    _id: string;
    name: string;
  };
  timestamp: string;
  reason?: string;
};

type UserDashboardData = {
  tasks: {
    assigned: DashboardTaskItem[];
    inProgress: DashboardTaskItem[];
    submitted: DashboardTaskItem[];
    upcoming: DashboardTaskItem[];
    overdue: DashboardTaskItem[];
    recent: DashboardTaskItem[];
    completed: DashboardTaskItem[];
  };
  mentions: UserDashboardNoteMention[];
  stats: {
    totalAssigned: number;
    totalCompleted: number;
    totalPending: number;
    totalOverdue: number;
  };
  activity: UserDashboardActivity[];
  suggestions: string[];
};

type ApiResponse<T> = {
  statuscode: number;
  success: boolean;
  message: string;
  data: T;
};
```

### TypeScript API Helper (Axios)

```ts
import axios from "axios";

export const getMyDashboard = () =>
  axios
    .get<ApiResponse<UserDashboardData>>("/dashboard/me")
    .then((res) => res.data.data);
```

---

## Project Members

### Get Project Members

```http
GET /projects/:projectId/members
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Project members fetched successfully",
  "data": [
    {
      "_id": "676a...",
      "user": {
        "_id": "676a...",
        "username": "johndoe",
        "avatar": {
          "url": "https://...",
          "localPath": ""
        }
      },
      "project": "676a...",
      "role": "owner",
      "createdAt": "2024-12-24T...",
      "updatedAt": "2024-12-24T..."
    }
  ]
}
```

### Add Project Member

```http
POST /projects/:projectId/members
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "userId": "676a...",
  "role": "member"
}
```

**Required Role:** `project_admin` or `owner`

**Available Roles:** `viewer`, `member`, `project_admin`, `owner`

**Response (201):**

```json
{
  "statuscode": 201,
  "success": true,
  "message": "Member added to project",
  "data": {
    "id": "676a...",
    "project": "676a...",
    "role": "member",
    "user": {
      "id": "676a...",
      "username": "janedoe",
      "email": "jane@example.com"
    }
  }
}
```

### Update Member Role

```http
PATCH /projects/:projectId/members/:memberId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "role": "project_admin"
}
```

**Required Role:** `project_admin` or `owner`

**Restrictions:**

- Cannot change your own role
- Cannot remove the last owner (assign another owner first)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Member role updated successfully",
  "data": {
    "user": {
      "_id": "676a...",
      "username": "janedoe",
      "email": "jane@example.com",
      "avatar": { "url": "https://..." }
    },
    "project": "676a...",
    "role": "project_admin"
  }
}
```

### Remove Project Member

```http
DELETE /projects/:projectId/members/:memberId
Authorization: Bearer <accessToken>
```

**Required Role:** `project_admin` or `owner`

**Restrictions:**

- Cannot remove the last owner

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Member removed from project",
  "data": {
    "_id": "676a...",
    "user": "676a...",
    "project": "676a...",
    "role": "member"
  }
}
```

### Add Or Invite Project Member (By Email)

```http
POST /projects/:projectId/members/invite
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "role": "member"
}
```

**Required Role:** `project_admin` or `owner`

**Available Roles:** `viewer`, `member`, `project_admin`, `owner`

Behavior:

- If email belongs to an existing user not already in the project, member is added directly.
- If email does not belong to an existing user, a pending invite is created (24-hour expiry).

**Response (201) - Existing User Added:**

```json
{
  "statuscode": 201,
  "success": true,
  "message": "Member added to project",
  "data": {
    "_id": "676a...",
    "user": {
      "_id": "676a...",
      "username": "janedoe",
      "email": "jane@example.com",
      "avatar": {
        "url": "https://...",
        "localPath": ""
      }
    },
    "project": "676a...",
    "role": "member",
    "createdAt": "2026-04-21T...",
    "updatedAt": "2026-04-21T..."
  }
}
```

**Response (201) - Invite Created:**

```json
{
  "statuscode": 201,
  "success": true,
  "message": "Invite created successfully",
  "data": {
    "_id": "676a...",
    "email": "newuser@example.com",
    "project": "676a...",
    "role": "member",
    "invitedBy": "676a...",
    "expiresAt": "2026-04-22T...",
    "status": "pending"
  }
}
```

**Common Error Cases:**

- `409` if user is already a project member.
- `409` if a pending invite already exists for the same `email + project`.

### Delete Pending Project Invite

```http
DELETE /projects/:projectId/invites/:inviteId
Authorization: Bearer <accessToken>
```

**Required Role:** `project_admin` or `owner`

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Invite removed successfully",
  "data": {
    "_id": "676a...",
    "email": "newuser@example.com",
    "project": "676a...",
    "role": "member",
    "invitedBy": "676a...",
    "token": "...",
    "expiresAt": "2026-04-22T...",
    "status": "pending",
    "createdAt": "2026-04-21T...",
    "updatedAt": "2026-04-21T..."
  }
}
```

---

## Users

### Search Users

```http
GET /users/search?q=john&page=1&limit=10
Authorization: Bearer <accessToken>
```

**Required Role:** Authenticated user

**Query Parameters:**

- `q` (required): Search text (matches `username` or `email`, case-insensitive)
- `page` (optional): Page number (default: `1`)
- `limit` (optional): Items per page (default: `10`, max: `100`)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "_id": "676a...",
        "username": "johndoe",
        "email": "john@example.com",
        "avatar": {
          "url": "https://...",
          "localPath": ""
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

## Invites

### Accept Project Invite

```http
POST /invites/:token/accept
Authorization: Bearer <accessToken>
```

**Required Role:** Authenticated user

**Important Validation:**

- Invite must exist.
- Invite status must be `pending`.
- Invite must not be expired.
- Logged-in user email must match invite email.

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Invite accepted successfully",
  "data": {
    "_id": "676a...",
    "user": {
      "_id": "676a...",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": {
        "url": "https://...",
        "localPath": ""
      }
    },
    "project": "676a...",
    "role": "member",
    "createdAt": "2026-04-21T...",
    "updatedAt": "2026-04-21T..."
  }
}
```

**Common Error Cases:**

- `403`: Invite is not assigned to the logged-in account.
- `404`: Invite not found or project no longer exists.
- `409`: Invite is no longer pending.
- `410`: Invite has expired.

---

## Tasks

### Task Status Lifecycle (Updated)

Current task flow is now:

```text
todo -> in_progress -> submitted -> done (approved)
                           \-> in_progress (rejected)
```

Important behavior:

- `done` cannot be set directly from regular task update endpoint.
- `submitted` cannot be set from regular task update endpoint.
- Assignee submits work via submit endpoint.
- Management (`owner`, `project_admin`) verifies submission via verify endpoint.
- Rejected verification sends task back to `in_progress`.

### Get Project Tasks (Paginated)

```http
GET /projects/:projectId/tasks?page=1&limit=10
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Project tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "_id": "676a...",
        "title": "Implement login feature",
        "description": "Add JWT authentication",
        "project": "676a...",
        "createdBy": {
          "_id": "676a...",
          "username": "johndoe",
          "avatar": { "url": "https://..." }
        },
        "assignedTo": {
          "_id": "676a...",
          "username": "janedoe",
          "avatar": { "url": "https://..." }
        },
        "status": "in_progress",
        "priority": "high",
        "difficulty": "medium",
        "credits": 10,
        "dueDate": "2025-01-15T00:00:00.000Z",
        "attachments": [
          {
            "url": "https://...",
            "public_id": "abc123",
            "resource_type": "image",
            "bytes": 12345,
            "format": "png",
            "original_filename": "screenshot.png",
            "mimeType": "image/png"
          }
        ],
        "createdAt": "2024-12-24T...",
        "updatedAt": "2024-12-24T..."
      }
    ],
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

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### Create Task

```http
POST /projects/:projectId/tasks
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

title=Implement feature
description=Detailed description
assignedTo=676a...
status=todo
priority=high
difficulty=medium
credits=10
dueDate=2025-01-15T00:00:00.000Z
attachments=<file>
attachments=<file>
```

**Required Role:** `project_admin` or `owner`

**Fields:**

- `title` (required): Task title
- `description` (required): Task description
- `assignedTo` (required): User ID who will work on task
- `status` (optional): `todo`, `in_progress`, `done` (default: `todo`)
- `priority` (optional): `low`, `medium`, `high`, `critical` (default: `medium`)
- `difficulty` (optional): `easy`, `medium`, `hard`, `expert` (default: `medium`)
- `credits` (optional): Number (default: 0)
- `dueDate` (optional): ISO date string
- `attachments` (optional): Files (max 5)

**Response (201):**

```json
{
  "statuscode": 201,
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "676a...",
    "title": "Implement feature"
    // ... all task fields
  }
}
```

### Update Task

```http
PATCH /projects/:projectId/tasks/:taskId
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

title=Updated title
status=in_progress
removeFiles=["public_id_1", "public_id_2"]
attachments=<new_file>
```

**Required Role:** `project_admin` or `owner`

**Fields:**

- All fields from create task (optional)
- `removeFiles` (optional): Array of `public_id` strings to delete from attachments

**Status Transition Note:**

- Use this endpoint for normal edits and for transitions like `todo -> in_progress`.
- This endpoint rejects direct updates to `submitted` and `done`.
- Use submit/verify endpoints below for review flow.

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "676a..."
    // ... updated task fields
  }
}
```

### Delete Task

```http
DELETE /projects/:projectId/tasks/:taskId
Authorization: Bearer <accessToken>
```

**Required Role:** `project_admin` or `owner`

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

**Note:** Cascades deletion to all comments and subtasks.

### Submit Task For Review

```http
PATCH /projects/:projectId/tasks/:taskId/submit
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

comment=Completed implementation, please review
attachments=<file>
attachments=<file>
```

**Required Role:** `member`, `project_admin`, or `owner`

**Additional Restrictions:**

- Only the assigned user can submit.
- Task must currently be in `in_progress`.

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Task submitted for review",
  "data": {
    "_id": "676a...",
    "status": "submitted",
    "submission": {
      "comment": "Completed implementation, please review",
      "attachments": [
        {
          "url": "https://...",
          "public_id": "abc123",
          "resource_type": "image",
          "bytes": 12345,
          "format": "png",
          "original_filename": "screenshot.png",
          "mimeType": "image/png"
        }
      ],
      "submittedAt": "2024-12-24T..."
    },
    "verification": {
      "status": "pending"
    }
  }
}
```

### Verify Submitted Task (Approve / Reject)

```http
PATCH /projects/:projectId/tasks/:taskId/verify
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "action": "approve"
}
```

Or reject:

```http
PATCH /projects/:projectId/tasks/:taskId/verify
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "action": "reject",
  "reason": "Please attach test evidence"
}
```

**Required Role:** `project_admin` or `owner`

**Additional Restrictions:**

- Task must currently be in `submitted`.
- Verification state must be `pending`.
- Rejection requires non-empty `reason`.

**Approve Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Task approved and contribution recorded",
  "data": {
    "taskId": "676a...",
    "action": "approved"
  }
}
```

**Reject Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Task rejected, sent back to assignee",
  "data": {
    "taskId": "676a...",
    "action": "rejected"
  }
}
```

---

## Leaderboard

### Get Project Leaderboard (Paginated)

```http
GET /projects/:projectId/leaderboard?page=1&limit=10
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Sort Order:**

- `stats.totalCredits` descending
- `stats.tasksCompleted` descending
- `stats.onTimeTasks` descending
- `updatedAt` ascending

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Leaderboard fetched successfully",
  "data": {
    "leaders": [
      {
        "_id": "676a...",
        "user": {
          "_id": "676a...",
          "username": "johndoe",
          "avatar": {
            "url": "https://...",
            "localPath": ""
          }
        },
        "role": "member",
        "stats": {
          "totalCredits": 120,
          "tasksCompleted": 15,
          "onTimeTasks": 11
        },
        "updatedAt": "2024-12-24T..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 22
    },
    "currentUser": {
      "rank": 3,
      "totalCredits": 95
    }
  }
}
```

### Get Global Leaderboard (Paginated)

```http
GET /leaderboard/global?page=1&limit=10
Authorization: Bearer <accessToken>
```

**Required Role:** Authenticated user

**Sort Order:**

- `stats.totalCredits` descending
- `stats.totalTasksCompleted` descending
- `stats.onTimeTasks` descending
- `updatedAt` ascending

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Leaderboard fetched successfully",
  "data": {
    "leaders": [
      {
        "_id": "676a...",
        "username": "johndoe",
        "avatar": {
          "url": "https://...",
          "localPath": ""
        },
        "stats": {
          "totalCredits": 320,
          "totalTasksCompleted": 44,
          "onTimeTasks": 36
        },
        "updatedAt": "2024-12-24T..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150
    },
    "currentUser": {
      "rank": 12,
      "totalCredits": 110
    }
  }
}
```

**Frontend Notes:**

- `currentUser.rank` can be `null` when rank is unavailable.
- Missing stats are normalized to `0` in backend response.
- Use `leaders` + `pagination` + `currentUser` from `data` directly.

### TypeScript Interfaces (Frontend Ready)

```ts
type Avatar = {
  url?: string;
  public_id?: string;
  localPath?: string;
};

type LeaderboardPagination = {
  page: number;
  limit: number;
  total: number;
};

type LeaderboardCurrentUser = {
  rank: number | null;
  totalCredits: number;
};

type ProjectLeaderboardStats = {
  totalCredits: number;
  tasksCompleted: number;
  onTimeTasks: number;
};

type ProjectLeaderboardLeader = {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar: Avatar;
  };
  role: "owner" | "project_admin" | "member" | "viewer";
  stats: ProjectLeaderboardStats;
  updatedAt: string;
};

type GlobalLeaderboardStats = {
  totalCredits: number;
  totalTasksCompleted: number;
  onTimeTasks: number;
};

type GlobalLeaderboardLeader = {
  _id: string;
  username: string;
  avatar: Avatar;
  stats: GlobalLeaderboardStats;
  updatedAt: string;
};

type ProjectLeaderboardData = {
  leaders: ProjectLeaderboardLeader[];
  pagination: LeaderboardPagination;
  currentUser: LeaderboardCurrentUser;
};

type GlobalLeaderboardData = {
  leaders: GlobalLeaderboardLeader[];
  pagination: LeaderboardPagination;
  currentUser: LeaderboardCurrentUser;
};

type ApiResponse<T> = {
  statuscode: number;
  success: boolean;
  message: string;
  data: T;
};
```

### TypeScript API Helpers (Axios)

```ts
import axios from "axios";

export const getProjectLeaderboard = (
  projectId: string,
  page = 1,
  limit = 10,
) =>
  axios
    .get<
      ApiResponse<ProjectLeaderboardData>
    >(`/projects/${projectId}/leaderboard?page=${page}&limit=${limit}`)
    .then((res) => res.data.data);

export const getGlobalLeaderboard = (page = 1, limit = 10) =>
  axios
    .get<
      ApiResponse<GlobalLeaderboardData>
    >(`/leaderboard/global?page=${page}&limit=${limit}`)
    .then((res) => res.data.data);
```

### Common Leaderboard Error Cases

- `401`: Missing or expired token.
- `403`: User is not a project member (project leaderboard only).
- `404`: Project not found (project leaderboard only).

---

## Comments

⚠️ **Important:** All comment routes now require `projectId` parameter.

### Create Comment

```http
POST /comments/:projectId/tasks/:taskId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "This is a comment",
  "attachments": ["https://..."]
}
```

**Required Role:** Any project member (viewer and above)

**Response (201):**

```json
{
  "statuscode": 201,
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "676a...",
    "content": "This is a comment",
    "task": "676a...",
    "user": {
      "_id": "676a...",
      "username": "johndoe",
      "avatar": { "url": "https://..." }
    },
    "attachments": ["https://..."],
    "createdAt": "2024-12-24T...",
    "updatedAt": "2024-12-24T..."
  }
}
```

### Get Task Comments

```http
GET /comments/:projectId/tasks/:taskId
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Comments fetched successfully",
  "data": [
    {
      "_id": "676a...",
      "content": "This is a comment",
      "task": "676a...",
      "user": {
        "_id": "676a...",
        "username": "johndoe",
        "avatar": { "url": "https://..." }
      },
      "attachments": [],
      "createdAt": "2024-12-24T...",
      "updatedAt": "2024-12-24T..."
    }
  ]
}
```

### Update Comment

```http
PATCH /comments/:projectId/edit/:commentId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Updated comment text",
  "attachments": ["https://..."]
}
```

**Required Role:** Any project member (can only edit own comments)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "_id": "676a...",
    "content": "Updated comment text"
    // ... other fields
  }
}
```

### Delete Comment

```http
DELETE /comments/:projectId/edit/:commentId
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (can delete own comments or project owner can delete any)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Comment deleted successfully",
  "data": null
}
```

---

## SubTasks

⚠️ **Important:** All subtask routes now require `projectId` parameter.

### Create SubTask

```http
POST /subtasks/:projectId/tasks/:taskId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Subtask title",
  "isCompleted": false
}
```

**Required Role:** `member`, `project_admin`, or `owner`

**Response (201):**

```json
{
  "statuscode": 201,
  "success": true,
  "message": "New Sub Task created successfully",
  "data": {
    "_id": "676a...",
    "title": "Subtask title",
    "task": "676a...",
    "isCompleted": false,
    "createdBy": {
      "_id": "676a...",
      "avatar": { "url": "https://..." },
      "username": "johndoe"
    },
    "createdAt": "2024-12-24T...",
    "updatedAt": "2024-12-24T..."
  }
}
```

### Get Task SubTasks (Paginated)

```http
GET /subtasks/:projectId/tasks/:taskId?page=1&limit=10
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Subtasks fetched successfully",
  "data": {
    "items": [
      {
        "_id": "676a...",
        "title": "Subtask title",
        "task": "676a...",
        "isCompleted": false,
        "createdBy": {
          "_id": "676a...",
          "avatar": { "url": "https://..." },
          "username": "johndoe"
        },
        "createdAt": "2024-12-24T...",
        "updatedAt": "2024-12-24T..."
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 15,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### Update SubTask

```http
PATCH /subtasks/:projectId/:SubTaskId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated subtask title",
  "isCompleted": true
}
```

**Required Role:** `member`, `project_admin`, or `owner`

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Sub Task updated successfully",
  "data": {
    "_id": "676a...",
    "title": "Updated subtask title",
    "isCompleted": true
    // ... other fields
  }
}
```

### Delete SubTask

```http
DELETE /subtasks/:projectId/:SubTaskId
Authorization: Bearer <accessToken>
```

**Required Role:** `member`, `project_admin`, or `owner`

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Sub Task deleted successfully",
  "data": null
}
```

---

## Notes

### Create Note

```http
POST /projects/:projectId/notes
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "This is a note with @johndoe mention"
}
```

**Required Role:** `project_admin` or `owner`

**Note:** Use `@username` to mention users. They will be automatically extracted and linked.

**Response (201):**

```json
{
  "statuscode": 201,
  "success": true,
  "message": "Note created successfully",
  "data": {
    "_id": "676a...",
    "project": "676a...",
    "content": "This is a note with @johndoe mention",
    "createdBy": {
      "avatar": { "url": "https://..." },
      "username": "janedoe",
      "email": "jane@example.com"
    },
    "mentions": [
      {
        "user": {
          "avatar": { "url": "https://..." },
          "username": "johndoe",
          "email": "john@example.com"
        }
      }
    ],
    "createdAt": "2024-12-24T...",
    "updatedAt": "2024-12-24T..."
  }
}
```

### Get Project Notes

```http
GET /projects/:projectId/notes
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Project notes fetched successfully",
  "data": [
    {
      "_id": "676a...",
      "project": "676a...",
      "content": "Note content with @mentions",
      "createdBy": {
        "_id": "676a...",
        "avatar": { "url": "https://..." },
        "username": "johndoe"
      },
      "mentions": [
        {
          "user": {
            "_id": "676a...",
            "avatar": { "url": "https://..." },
            "username": "janedoe"
          }
        }
      ],
      "createdAt": "2024-12-24T...",
      "updatedAt": "2024-12-24T..."
    }
  ]
}
```

### Get Single Note

```http
GET /projects/:projectId/notes/:noteId
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Project note fetched successfully",
  "data": {
    "_id": "676a...",
    "project": {
      "_id": "676a...",
      "name": "Project Name"
    },
    "content": "Note content",
    "createdBy": {
      "avatar": { "url": "https://..." },
      "username": "johndoe",
      "email": "john@example.com"
    },
    "mentions": [],
    "createdAt": "2024-12-24T...",
    "updatedAt": "2024-12-24T..."
  }
}
```

### Update Note

```http
PATCH /projects/:projectId/notes/:noteId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Updated note content with @newuser"
}
```

**Required Role:** `project_admin` or `owner` (can only update own notes)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "_id": "676a...",
    "content": "Updated note content with @newuser"
    // ... other fields
  }
}
```

### Delete Note

```http
DELETE /projects/:projectId/notes/:noteId
Authorization: Bearer <accessToken>
```

**Required Role:** `project_admin` or `owner` (can only delete own notes)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Note deleted successfully",
  "data": null
}
```

### Get My Mentions

```http
GET /projects/:projectId/notes/mentions/me
Authorization: Bearer <accessToken>
```

**Required Role:** Any project member (viewer and above)

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Notes with mentions fetched successfully",
  "data": [
    {
      "_id": "676a...",
      "project": {
        "_id": "676a...",
        "name": "Project Name"
      },
      "content": "Hey @johndoe check this out",
      "createdBy": {
        "avatar": { "url": "https://..." },
        "username": "janedoe",
        "email": "jane@example.com"
      },
      "mentions": [
        {
          "user": {
            "avatar": { "url": "https://..." },
            "username": "johndoe",
            "email": "john@example.com"
          }
        }
      ],
      "createdAt": "2024-12-24T...",
      "updatedAt": "2024-12-24T..."
    }
  ]
}
```

---

## Health Check

### API Health Probe

```http
GET /healthcheck
```

**Auth Required:** No

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "API is healthy ✅",
  "data": null
}
```

**Frontend Notes:**

- Useful for environment diagnostics in admin/debug pages.
- Safe to call on app bootstrap for basic backend availability checks.

---

## Common Patterns

### Role Hierarchy

```
┌─────────────┐
│  owner      │ ← Full access, can delete project
├─────────────┤
│project_admin│ ← Manage members, tasks, cannot delete project
├─────────────┤
│  member     │ ← Create/edit tasks, comments, subtasks
├─────────────┤
│  viewer     │ ← Read-only access
└─────────────┘
```

### Role Groups

```javascript
PROJECT_ROLES.MANAGEMENT = ["owner", "project_admin"];
PROJECT_ROLES.EDITORS = ["owner", "project_admin", "member"];
PROJECT_ROLES.VIEWERS = ["owner", "project_admin", "member", "viewer"];
```

### Task Status States

```javascript
taskStatusEnums = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  DONE: "done",
};
```

Practical workflow:

- Assignee starts task: `todo -> in_progress`
- Assignee submits: `in_progress -> submitted`
- Manager approves: `submitted -> done`
- Manager rejects: `submitted -> in_progress`

### Error Response Format

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

**In development:** Includes `stack` property with full stack trace.
**In production:** Stack trace omitted for security.

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, invalid format)
- `401` - Unauthorized (not logged in, invalid/expired token)
- `403` - Forbidden (insufficient permissions, not a project member)
- `404` - Not Found
- `409` - Conflict (duplicate entry, e.g., user already in project)
- `410` - Gone (expired invite links)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Pagination

All paginated endpoints accept:

- `page` query parameter (default: 1, min: 1)
- `limit` query parameter (default: 10, max: 100)

All paginated responses include:

```json
{
  "data": {
    "items": [...], // or "projects", "tasks", etc.
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

### File Uploads

Use `multipart/form-data` for endpoints accepting files:

- Maximum 5 files per request
- Supported formats: Images (jpg, png, gif), PDFs, videos
- Files stored on Cloudinary
- Each file includes: `url`, `public_id`, `resource_type`, `bytes`, `format`, `original_filename`, `mimeType`

### Authentication Flow

```
1. Register → 2. Verify Email → 3. Login → 4. Get accessToken + refreshToken
                                              ↓
5. Use accessToken for API calls ←───────────┘
                ↓
6. When expired, use refreshToken to get new accessToken
                ↓
7. Repeat step 5-6 until logout
```

### Token Refresh Strategy

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh tokens rotate on each use (new token returned)
- Old refresh tokens become invalid immediately
- Implement automatic token refresh in your frontend

### CORS Configuration

Allowed origins (configured via environment):

- `FRONTEND_URL` (e.g., http://localhost:3000)
- `BASE_URL` (e.g., http://localhost:8000)

Credentials (cookies) are enabled.

### Health Check

```http
GET /healthcheck
```

**Response (200):**

```json
{
  "statuscode": 200,
  "success": true,
  "message": "API is healthy ✅",
  "data": null
}
```

---

## Environment Variables Required

Frontend should configure:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
# or
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
# or
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Migration Notes for Existing Frontend

### Breaking Changes

1. **Comment Routes Changed:**

   ```javascript
   // OLD
   POST /api/v1/comments/:taskId
   GET /api/v1/comments/:taskId

   // NEW
   POST /api/v1/comments/:projectId/tasks/:taskId
   GET /api/v1/comments/:projectId/tasks/:taskId
   ```

2. **SubTask Routes Changed:**

   ```javascript
   // OLD
   POST /api/v1/subtasks/:taskId
   GET /api/v1/subtasks/:taskId

   // NEW
   POST /api/v1/subtasks/:projectId/tasks/:taskId
   GET /api/v1/subtasks/:projectId/tasks/:taskId
   ```

3. **Pagination Added:**
   - `GET /projects` now returns `{ projects, meta }` instead of flat array
   - `GET /projects/:projectId/tasks` now returns `{ tasks, meta }` instead of flat array

4. **Task Review Flow Added:**

- New endpoint: `PATCH /projects/:projectId/tasks/:taskId/submit`
- New endpoint: `PATCH /projects/:projectId/tasks/:taskId/verify`
- Task lifecycle changed from `todo -> in_progress -> done`
- New lifecycle: `todo -> in_progress -> submitted -> done` (approve) or `in_progress` (reject)

5. **Leaderboard Endpoints Added:**

- New endpoint: `GET /projects/:projectId/leaderboard`
- New endpoint: `GET /leaderboard/global`

6. **Member Invite + User Search Endpoints Added:**

- New endpoint: `GET /users/search?q=&page=&limit=`
- New endpoint: `POST /projects/:projectId/members/invite`
- New endpoint: `DELETE /projects/:projectId/invites/:inviteId`
- New endpoint: `POST /invites/:token/accept`

7. **Auth Verify Method Updated:**

- Verify email now uses `POST /auth/verify-email?token=<token>`

### Frontend Implementation Tips

```javascript
// Store projectId in context/state
const ProjectContext = createContext();

// Example API service with new routes
const api = {
  // Comments
  createComment: (projectId, taskId, data) =>
    axios.post(`/comments/${projectId}/tasks/${taskId}`, data),

  getComments: (projectId, taskId) =>
    axios.get(`/comments/${projectId}/tasks/${taskId}`),

  // SubTasks
  createSubTask: (projectId, taskId, data) =>
    axios.post(`/subtasks/${projectId}/tasks/${taskId}`, data),

  getSubTasks: (projectId, taskId, page = 1) =>
    axios.get(`/subtasks/${projectId}/tasks/${taskId}?page=${page}`),

  // Projects with pagination
  getProjects: (page = 1, limit = 10) =>
    axios.get(`/projects?page=${page}&limit=${limit}`).then((res) => ({
      projects: res.data.data.projects,
      meta: res.data.data.meta,
    })),
};

// Handle 403 errors (insufficient permissions)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Show user-friendly message about permissions
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  },
);
```

---

## Support

For issues or questions:

1. Check error message in response
2. Verify required role for endpoint
3. Ensure projectId is correct in new comment/subtask routes
4. Check pagination response structure for list endpoints

**Last Updated:** April 21, 2026
**API Version:** 1.0.0
