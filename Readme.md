# 📘 KaryaDesk – Modern Project Management Platform

KaryaDesk is a comprehensive, full-stack project management platform designed to help teams collaborate, track progress, and deliver projects efficiently. Built with modern web technologies, it offers real-time collaboration, role-based access control, and a seamless user experience.

---

## ✨ Features

### 🔐 Authentication & User Management

- Email/Password registration with email verification
- Secure JWT-based authentication (access + refresh tokens)
- Password reset and change functionality
- User profile management with avatar support
- Token refresh mechanism for seamless sessions

### 📁 Project Management

- Create and manage multiple projects
- GitHub repository integration
- Project tagging system
- Customizable project descriptions and deadlines
- Owner-based project deletion with cascading cleanup

### 👥 Team Collaboration

- Role-based access control (Owner, Project Admin, Member, Viewer)
- Invite team members with specific roles
- Update member roles and permissions
- Remove team members (with ownership protection)
- View all project members with their roles

### ✅ Task Management

- Create, assign, and track tasks
- Task statuses: Todo, In Progress, Done
- Priority levels: Low, Medium, High, Critical
- Difficulty ratings: Easy, Medium, Hard, Expert
- Credit/points system for gamification
- Due date tracking
- File attachments support (up to 5 files per task)
- Task assignment to team members
- Pagination support for large task lists

### 💬 Comments & Discussions

- Add comments to tasks with file attachments
- User mentions in comments
- Edit and delete your own comments
- Owner can moderate all comments
- Real-time collaboration through comment threads

### 📝 SubTasks

- Break down tasks into smaller subtasks
- Track completion status for each subtask
- Paginated subtask lists
- Create, update, and delete subtasks

### 📔 Project Notes

- Create project-wide notes
- Mention team members using @username
- Track who created each note
- View all mentions across notes
- Edit and delete your own notes

### 🎨 Advanced Features

- Pagination across all major endpoints
- File upload and management via Cloudinary
- Comprehensive error handling
- Rate limiting for API security
- CORS support for frontend integration

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (Access & Refresh Tokens)
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **Validation:** Express Validator + Custom Validators
- **Security:** Cookie-based token storage, CORS, Rate limiting, CSRF protection (double submit cookie pattern via csrf-csrf), HTTP security headers (Helmet)

---

## 🛡️ CSRF Protection

This app uses the **double submit cookie pattern** for CSRF protection on all state-changing endpoints (POST, PATCH, DELETE, etc.).

**How it works:**

- When a user logs in or loads the app, the frontend must fetch a CSRF token:
  - `GET /api/v1/auth/csrf-token`
  - The response will set a `csrf-token` cookie and return `{ csrfToken: "..." }` in the body.
- For all protected requests (POST, PATCH, DELETE), the frontend must:
  - Read the latest CSRF token value
  - Send it in the `x-csrf-token` header
  - Ensure the `csrf-token` cookie is present (sent automatically if `withCredentials: true`)
- The backend will reject requests with a 403 if the header and cookie do not match.

**Frontend integration tips:**

- Always call `/auth/csrf-token` after login and on app load if authenticated.
- Store the token in memory (not localStorage).
- Attach the `x-csrf-token` header for all protected API calls.

**Testing:**

- In Postman, fetch `/auth/csrf-token`, copy the token, and include both the cookie and header in protected requests.

**Why:**

- This prevents cross-site request forgery attacks while supporting modern SPA flows and secure cookies.

---

### Frontend (Recommended)

- **Build Tool:** Vite
- **Framework:** React 18+ with TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS + CSS Variables + shadcn/ui
- **Global State:** Zustand (for UI state, auth state)
- **Server State:** @tanstack/react-query (API data caching & sync)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts (for project analytics, task tracking)
- **HTTP Client:** Axios (with interceptors for token refresh)

---

## 📦 Project Structure

```
projectify/
├── src/
│   ├── app.js                      # Express app configuration
│   ├── index.js                    # Server entry point
│   ├── config/                     # Configuration files
│   │   ├── cloudinary.js           # Cloudinary setup
│   │   └── validateEnv.js          # Environment validation
│   ├── controllers/                # Route handlers
│   │   ├── auth.controllers.js
│   │   ├── project.controllers.js
│   │   ├── task.controllers.js
│   │   ├── comment.controllers.js
│   │   ├── subTask.controllers.js
│   │   ├── note.controllers.js
│   │   └── projectMember.controllers.js
│   ├── db/
│   │   └── dbConnect.js            # MongoDB connection
│   ├── middlewares/                # Express middlewares
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── upload.middleware.js    # File upload handling
│   │   ├── validate.middleware.js  # Request validation
│   │   └── error.middleware.js     # Error handling
│   ├── models/                     # Mongoose schemas
│   │   ├── user.models.js
│   │   ├── project.models.js
│   │   ├── task.models.js
│   │   ├── comment.models.js
│   │   ├── subtask.models.js
│   │   ├── notes.models.js
│   │   └── projectmember.models.js
│   ├── routes/                     # API routes
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   ├── comment.routes.js
│   │   ├── subTask.routes.js
│   │   ├── note.routes.js
│   │   └── projectMember.routes.js
│   ├── utils/                      # Utility functions
│   │   ├── api-error.js
│   │   ├── api-response.js
│   │   ├── async-handler.js
│   │   ├── constants.js
│   │   ├── mail.js
│   │   ├── pagination.js
│   │   └── validators.js
│   └── validators/                 # Request validators
│       ├── auth.validators.js
│       ├── task.validators.js
│       ├── comment.validators.js
│       ├── subtask.validators.js
│       └── notesValidators.js
├── public/
│   └── images/
├── .env.example
├── package.json
├── FRONTEND_API_DOCS.md
├── API_REFERENCE.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- SMTP server or email service (Gmail, SendGrid, etc.)

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/projectify.git
   cd projectify
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Server
   PORT=8000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/projectify
   # or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/projectify

   # JWT Secrets (use strong random strings)
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   EMAIL_FROM=noreply@projectify.com

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Frontend URL (for CORS and email links)
   FRONTEND_URL=http://localhost:5173
   BASE_URL=http://localhost:8000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:8000/api/v1`

5. **Verify the server is running**
   ```bash
   curl http://localhost:8000/api/v1/healthcheck
   ```

### Frontend Setup (Recommended Stack)

1. **Create a new Vite + React + TypeScript project**

   ```bash
   npm create vite@latest projectify-frontend -- --template react-ts
   cd projectify-frontend
   ```

2. **Install core dependencies**

   ```bash
   # Core packages
   npm install react-router-dom zustand @tanstack/react-query axios

   # Forms and validation
   npm install react-hook-form @hookform/resolvers zod

   # UI and styling
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p

   # shadcn/ui (follow their docs for setup)
   npx shadcn-ui@latest init

   # Charts
   npm install recharts

   # Utilities
   npm install clsx tailwind-merge date-fns
   ```

3. **Configure Tailwind CSS**

   Update `tailwind.config.js`:

   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
     theme: {
       extend: {
         colors: {
           // CSS variables for theme switching
           border: "hsl(var(--border))",
           input: "hsl(var(--input))",
           ring: "hsl(var(--ring))",
           background: "hsl(var(--background))",
           foreground: "hsl(var(--foreground))",
           primary: {
             DEFAULT: "hsl(var(--primary))",
             foreground: "hsl(var(--primary-foreground))",
           },
           secondary: {
             DEFAULT: "hsl(var(--secondary))",
             foreground: "hsl(var(--secondary-foreground))",
           },
           destructive: {
             DEFAULT: "hsl(var(--destructive))",
             foreground: "hsl(var(--destructive-foreground))",
           },
           muted: {
             DEFAULT: "hsl(var(--muted))",
             foreground: "hsl(var(--muted-foreground))",
           },
           accent: {
             DEFAULT: "hsl(var(--accent))",
             foreground: "hsl(var(--accent-foreground))",
           },
         },
         borderRadius: {
           lg: "var(--radius)",
           md: "calc(var(--radius) - 2px)",
           sm: "calc(var(--radius) - 4px)",
         },
       },
     },
     plugins: [],
   };
   ```

4. **Create environment configuration**

   Create `.env` file:

   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

5. **Project structure recommendation**

   ```
   src/
   ├── components/
   │   ├── ui/              # shadcn/ui components
   │   ├── auth/            # Login, Register, etc.
   │   ├── projects/        # Project cards, lists
   │   ├── tasks/           # Task components
   │   ├── layout/          # Layout components
   │   └── shared/          # Reusable components
   ├── pages/
   │   ├── auth/            # Auth pages
   │   ├── dashboard/       # Dashboard page
   │   ├── projects/        # Project pages
   │   └── tasks/           # Task pages
   ├── lib/
   │   ├── api/             # API client & services
   │   ├── hooks/           # Custom React hooks
   │   ├── utils/           # Utility functions
   │   └── constants.ts     # App constants
   ├── stores/              # Zustand stores
   │   ├── authStore.ts
   │   ├── uiStore.ts
   │   └── projectStore.ts
   ├── types/               # TypeScript types
   │   ├── api.types.ts
   │   ├── project.types.ts
   │   └── task.types.ts
   ├── styles/
   │   └── globals.css      # Global styles with CSS variables
   ├── App.tsx
   └── main.tsx
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🏗️ Frontend Architecture Best Practices

### 1. API Client Setup (Axios with Interceptors)

```typescript
// src/lib/api/client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await apiClient.post("/auth/refresh-token");
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
```

### 2. React Query Setup

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// src/main.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 3. Zustand Store Example

```typescript
// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: { url: string };
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
```

### 4. React Query Hook Example

```typescript
// src/lib/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../api/projects";

export const useProjects = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["projects", page, limit],
    queryFn: () => projectApi.getAll(page, limit),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
```

### 5. Form with React Hook Form + Zod

```typescript
// src/components/projects/CreateProjectForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  endDate: z.string().optional(),
  githubRepo: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectForm = () => {
  const { mutate: createProject } = useCreateProject();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProject(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### 6. TypeScript Types

```typescript
// src/types/api.types.ts
export interface ApiResponse<T> {
  statuscode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// src/types/project.types.ts
export interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  endDate?: string;
  githubRepo?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectRole = "viewer" | "member" | "project_admin" | "owner";
```

---

## 📚 API Documentation

Comprehensive API documentation is available in:

- **[FRONTEND_API_DOCS.md](./FRONTEND_API_DOCS.md)** - Complete API reference for frontend integration
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Detailed technical API documentation

### Quick API Overview

**Base URL:** `http://localhost:8000/api/v1`

**Authentication:**

- Cookie-based (automatic)
- Header: `Authorization: Bearer <token>`

**Main Endpoints:**

- `/auth/*` - Authentication & user management
- `/projects` - Project CRUD operations
- `/projects/:projectId/members` - Team management
- `/projects/:projectId/tasks` - Task management
- `/comments/:projectId/tasks/:taskId` - Comments
- `/subtasks/:projectId/tasks/:taskId` - SubTasks
- `/projects/:projectId/notes` - Project notes

---

## 👥 User Roles & Permissions

| Role              | Permissions                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Owner**         | Full access, can delete project, manage all members, all project_admin permissions                  |
| **Project Admin** | Manage members & roles, create/update/delete tasks, manage project settings (cannot delete project) |
| **Member**        | Create/edit tasks, comments, subtasks, view all project data                                        |
| **Viewer**        | Read-only access to projects, tasks, comments, notes                                                |

### Role Hierarchy

```
Owner > Project Admin > Member > Viewer
```

---

## 🔒 Security Features

- JWT access & refresh token rotation
- HTTP-only cookies for token storage
- Password hashing with bcrypt
- Email verification required for new accounts
- Rate limiting on sensitive endpoints
- CORS configuration for frontend
- Input validation and sanitization
- SQL injection and XSS protection
- Secure file upload with size & type restrictions

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

---

## 📈 Development Workflow

1. **Feature Branches**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Commit Convention**

   ```bash
   git commit -m "feat: add user profile page"
   git commit -m "fix: resolve token refresh issue"
   git commit -m "docs: update API documentation"
   ```

3. **Pull Request**
   - Write clear PR descriptions
   - Link related issues
   - Request code review
   - Ensure all tests pass

---

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Set environment variables in your hosting platform
2. Ensure MongoDB connection string is set
3. Configure CORS for your frontend domain
4. Deploy using Git integration or CLI

### Frontend Deployment (Vercel/Netlify)

1. Build the project:

   ```bash
   npm run build
   ```

2. Set environment variable:

   ```
   VITE_API_BASE_URL=https://your-api-domain.com/api/v1
   ```

3. Deploy the `dist` folder

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Token refresh not working**

- Ensure `withCredentials: true` in Axios config
- Check CORS configuration includes credentials
- Verify refresh token cookie is being sent

**Issue: File uploads failing**

- Check Cloudinary credentials
- Verify file size limits
- Ensure proper `Content-Type: multipart/form-data`

**Issue: 403 Forbidden errors**

- Verify user has correct role for the action
- Check if user is a project member
- Ensure token is valid and not expired

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request

### Code Style Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Keep components small and focused

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Mahatejshvi Vareny Swami**  
📧 tejshvisharma27@gmail.com

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [React](https://react.dev/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TanStack Query](https://tanstack.com/query) - Server state management
- [Cloudinary](https://cloudinary.com/) - File storage

---

## 📊 Project Status

✅ Backend API Complete  
🚧 Frontend Development (In Progress)  
⏳ Testing Suite (Planned)  
⏳ Mobile App (Future)

---

**Last Updated:** January 3, 2026  
**Version:** 1.0.0
