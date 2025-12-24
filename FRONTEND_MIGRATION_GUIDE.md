# Frontend Migration Guide - Projectify Backend Security Update

## Overview

This guide helps frontend developers migrate to the updated backend API with enhanced security and RBAC enforcement.

---

## ⚠️ Breaking Changes Summary

### 1. Comment Routes - Path Changes

**Impact:** High - All comment API calls need updating

**Before:**

```javascript
// Create comment
POST /api/v1/comments/:taskId

// Get comments
GET /api/v1/comments/:taskId

// Update/Delete comment
PATCH /api/v1/comments/edit/:commentId
DELETE /api/v1/comments/edit/:commentId
```

**After:**

```javascript
// Create comment - NOW REQUIRES projectId
POST /api/v1/comments/:projectId/tasks/:taskId

// Get comments - NOW REQUIRES projectId
GET /api/v1/comments/:projectId/tasks/:taskId

// Update/Delete comment - NOW REQUIRES projectId
PATCH /api/v1/comments/:projectId/edit/:commentId
DELETE /api/v1/comments/:projectId/edit/:commentId
```

**Migration Example:**

```javascript
// OLD
const createComment = async (taskId, content) => {
  return axios.post(`/api/v1/comments/${taskId}`, { content });
};

// NEW
const createComment = async (projectId, taskId, content) => {
  return axios.post(`/api/v1/comments/${projectId}/tasks/${taskId}`, {
    content,
  });
};
```

---

### 2. SubTask Routes - Path Changes

**Impact:** High - All subtask API calls need updating

**Before:**

```javascript
POST /api/v1/subtasks/:taskId
GET /api/v1/subtasks/:taskId
PATCH /api/v1/subtasks/:SubTaskId
DELETE /api/v1/subtasks/:SubTaskId
```

**After:**

```javascript
POST /api/v1/subtasks/:projectId/tasks/:taskId
GET /api/v1/subtasks/:projectId/tasks/:taskId
PATCH /api/v1/subtasks/:projectId/:SubTaskId
DELETE /api/v1/subtasks/:projectId/:SubTaskId
```

**Migration Example:**

```javascript
// OLD
const getSubtasks = async (taskId) => {
  return axios.get(`/api/v1/subtasks/${taskId}`);
};

// NEW
const getSubtasks = async (projectId, taskId) => {
  return axios.get(`/api/v1/subtasks/${projectId}/tasks/${taskId}`);
};
```

---

### 3. Pagination - Response Structure Changes

**Impact:** Medium - List endpoints now return paginated data

**Affected Endpoints:**

- `GET /api/v1/projects`
- `GET /api/v1/projects/:projectId/tasks`
- `GET /api/v1/subtasks/:projectId/tasks/:taskId`

**Before:**

```javascript
// Response was a flat array
{
  "statuscode": 200,
  "success": true,
  "message": "Projects fetched successfully",
  "data": [
    { id: "1", name: "Project 1" },
    { id: "2", name: "Project 2" }
  ]
}
```

**After:**

```javascript
// Response includes data and meta
{
  "statuscode": 200,
  "success": true,
  "message": "Projects fetched successfully",
  "data": {
    "projects": [
      { id: "1", name: "Project 1" },
      { id: "2", name: "Project 2" }
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

**Migration Example:**

```javascript
// OLD
const [projects, setProjects] = useState([]);

const fetchProjects = async () => {
  const response = await axios.get("/api/v1/projects");
  setProjects(response.data.data); // data was array
};

// NEW
const [projects, setProjects] = useState([]);
const [pagination, setPagination] = useState(null);

const fetchProjects = async (page = 1, limit = 10) => {
  const response = await axios.get(
    `/api/v1/projects?page=${page}&limit=${limit}`,
  );
  setProjects(response.data.data.projects); // Now nested
  setPagination(response.data.data.meta); // Get pagination info
};
```

---

## ✅ Non-Breaking Changes (No Action Required)

### 1. Enhanced Authorization

- Backend now validates project membership on all routes
- Invalid requests return `403 Forbidden` instead of potentially exposing data
- **Action:** Handle 403 errors gracefully in your UI

### 2. Refresh Token Rotation

- Refresh tokens now rotate on each use
- Old tokens are invalidated
- **Action:** None - transparent to frontend

### 3. Error Messages

- More specific error messages for authorization failures
- Example: "Access denied. Required roles: owner, project_admin. Your role: viewer"
- **Action:** Display these messages to users for better UX

---

## 🔄 Recommended Updates

### 1. Store ProjectId in Context

Since many routes now require `projectId`, store it in React Context or state management:

```javascript
// Context setup
const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

// Usage in components
const TaskComments = () => {
  const { currentProject } = useContext(ProjectContext);
  const [comments, setComments] = useState([]);

  const fetchComments = async (taskId) => {
    const response = await axios.get(
      `/api/v1/comments/${currentProject.id}/tasks/${taskId}`,
    );
    setComments(response.data.data);
  };

  return /* ... */;
};
```

### 2. Implement Pagination UI

Create reusable pagination components:

```javascript
const PaginationControls = ({ meta, onPageChange }) => {
  return (
    <div className="pagination">
      <button
        disabled={!meta.hasPrevPage}
        onClick={() => onPageChange(meta.page - 1)}
      >
        Previous
      </button>

      <span>
        Page {meta.page} of {meta.totalPages}
      </span>

      <button
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Next
      </button>
    </div>
  );
};

// Usage
const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState(null);

  const fetchProjects = async (page) => {
    const response = await axios.get(`/api/v1/projects?page=${page}&limit=10`);
    setProjects(response.data.data.projects);
    setMeta(response.data.data.meta);
  };

  return (
    <>
      <ProjectGrid projects={projects} />
      {meta && <PaginationControls meta={meta} onPageChange={fetchProjects} />}
    </>
  );
};
```

### 3. Handle Role-Based UI

Show/hide actions based on user's role:

```javascript
const TaskActions = ({ task, userRole }) => {
  const canEdit = ["owner", "project_admin", "member"].includes(userRole);
  const canDelete = ["owner", "project_admin"].includes(userRole);

  return (
    <div>
      <button>View</button>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </div>
  );
};
```

### 4. Update API Service Layer

If using an API service layer, update all affected methods:

```javascript
// api/comments.js
export const commentService = {
  create: (projectId, taskId, data) =>
    axios.post(`/api/v1/comments/${projectId}/tasks/${taskId}`, data),

  getAll: (projectId, taskId) =>
    axios.get(`/api/v1/comments/${projectId}/tasks/${taskId}`),

  update: (projectId, commentId, data) =>
    axios.patch(`/api/v1/comments/${projectId}/edit/${commentId}`, data),

  delete: (projectId, commentId) =>
    axios.delete(`/api/v1/comments/${projectId}/edit/${commentId}`),
};

// api/subtasks.js
export const subtaskService = {
  create: (projectId, taskId, data) =>
    axios.post(`/api/v1/subtasks/${projectId}/tasks/${taskId}`, data),

  getAll: (projectId, taskId, page = 1, limit = 10) =>
    axios.get(
      `/api/v1/subtasks/${projectId}/tasks/${taskId}?page=${page}&limit=${limit}`,
    ),

  update: (projectId, subtaskId, data) =>
    axios.patch(`/api/v1/subtasks/${projectId}/${subtaskId}`, data),

  delete: (projectId, subtaskId) =>
    axios.delete(`/api/v1/subtasks/${projectId}/${subtaskId}`),
};
```

---

## 🧪 Testing Checklist

### Test Cases to Verify

- [ ] **Projects:** List, create, update, delete
- [ ] **Members:** Add, update role, remove
- [ ] **Tasks:** List with pagination, create, update, delete
- [ ] **Comments:** Create/view/edit/delete with new projectId parameter
- [ ] **Subtasks:** Create/view/edit/delete with new projectId parameter
- [ ] **Pagination:** Navigate between pages, verify counts
- [ ] **Roles:** Verify UI shows/hides actions based on role
- [ ] **Errors:** 403 errors display correctly, 404 for invalid IDs

### Role-Based Testing

Test each feature as different roles:

- [ ] **Viewer:** Can view all, cannot edit/delete
- [ ] **Member:** Can edit tasks/comments, cannot manage members
- [ ] **Project Admin:** Can manage everything except delete project
- [ ] **Owner:** Full access including project deletion

---

## 📋 Migration Step-by-Step

### Phase 1: Update API Calls (Required)

1. Update all comment-related API calls to include `projectId`
2. Update all subtask-related API calls to include `projectId`
3. Update project/task list handling for pagination

### Phase 2: Update State Management (Recommended)

1. Add pagination state to list components
2. Store current project context
3. Implement pagination UI components

### Phase 3: Enhance UX (Recommended)

1. Add role-based UI visibility
2. Improve error message display
3. Add loading states for pagination

### Phase 4: Testing (Required)

1. Test all CRUD operations
2. Verify pagination works correctly
3. Test role-based access
4. Test error handling

---

## 🆘 Common Issues & Solutions

### Issue: 403 Forbidden on comment/subtask routes

**Cause:** User not a member of the project, or insufficient role
**Solution:**

```javascript
// Check membership before making request
if (!currentProject || !currentProject.membership) {
  return <Redirect to="/projects" />;
}
```

### Issue: "Cannot read property 'projects' of undefined"

**Cause:** Trying to access old response structure
**Solution:**

```javascript
// OLD: response.data.data (array)
// NEW: response.data.data.projects (array)
const projects = response.data.data.projects;
```

### Issue: Pagination not showing all items

**Cause:** Default limit is 10, not retrieving all items
**Solution:**

```javascript
// Fetch with higher limit if needed
const response = await axios.get("/api/v1/projects?limit=50");

// Or implement "Load More" functionality
const loadMore = () => {
  setPage(page + 1);
  fetchProjects(page + 1);
};
```

---

## 📞 Support & Resources

- **Implementation Summary:** See `IMPLEMENTATION_SUMMARY.md` for complete list of changes
- **API Reference:** See `API_REFERENCE.md` for endpoint documentation
- **Example Requests:** See Postman collection (if available)

---

## Timeline Recommendation

- **Week 1:** Update comment and subtask API calls (breaking changes)
- **Week 2:** Implement pagination UI
- **Week 3:** Add role-based UI enhancements
- **Week 4:** Testing and bug fixes

Prioritize Phase 1 as it contains breaking changes that will cause errors in production.
