# 🚀 Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:5000`

## Setup (First Time)

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**

   ```bash
   # .env file is already created with default values
   # Verify it contains:
   VITE_API_URL=http://localhost:5000/api/v1
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

## Testing the Auth Flow

### 1. Register a New User

- Navigate to `http://localhost:3000/register`
- Fill in the registration form
- Submit → Should redirect to `/projects` if successful

### 2. Login

- Navigate to `http://localhost:3000/login`
- Enter credentials
- Submit → Should redirect to `/projects` if successful

### 3. Test Protected Routes

- Try accessing `http://localhost:3000/projects` without logging in
- Should redirect to `/login`
- After login, should be able to access protected routes

### 4. Test Session Persistence

- Login successfully
- Refresh the page
- Should remain logged in (if backend cookie is valid)

### 5. Test Logout

- Click the "Logout" button in the sidebar
- Should redirect to `/login`
- Try accessing `/projects` → should redirect to login

## Available Routes

### Public Routes

- `/login` - Login page
- `/register` - Registration page

### Protected Routes (require authentication)

- `/projects` - Projects list page
- `/projects/:projectId` - Project details page

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint code
npm run lint
```

## Project Structure Quick Reference

```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication feature
│   └── projects/      # Projects feature
├── components/        # Reusable components
│   ├── ui/           # UI primitives
│   └── layout/       # Layout components
├── lib/              # Shared utilities
├── stores/           # Zustand stores
├── app/              # App configuration
└── styles/           # Global styles
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run dev
```

### Cannot Connect to Backend

Ensure:

1. Backend server is running on `http://localhost:5000`
2. `.env` file has correct `VITE_API_URL`
3. Backend CORS is configured to allow `http://localhost:3000`

### Import Errors

```bash
# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P (or Cmd+Shift+P on Mac)
# Type: TypeScript: Restart TS Server
```

## Next Steps

1. **Start the backend server** in the `backend` folder
2. **Create a test user** via the register page
3. **Explore the application** structure
4. **Read ARCHITECTURE.md** for detailed flow diagrams
5. **Check PHASE_1_COMPLETE.md** for implementation details

## Important Notes

- ⚠️ **No business logic yet** - This is Phase 1 (foundation only)
- ⚠️ **Placeholder content** - Pages show sample data
- ⚠️ **HTTP-only cookies** - Auth tokens stored in cookies, not localStorage
- ✅ **Ready for Phase 2** - Architecture is production-ready for feature implementation

## Getting Help

- Check `README.md` for detailed documentation
- Check `ARCHITECTURE.md` for flow diagrams
- Check `PHASE_1_COMPLETE.md` for implementation checklist
- Review inline code comments for context

---

**Happy Coding! 🎉**
