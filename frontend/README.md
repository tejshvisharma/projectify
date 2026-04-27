# KaryaDesk Frontend

Modern React TypeScript frontend for the KaryaDesk Project Management System, built with Vite.

## Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v6
- **State Management**: Zustand (auth state)
- **Server State**: TanStack Query (React Query)
- **HTTP Client**: Axios with interceptors
- **Authentication**: HTTP-only cookie-based JWT auth

## Project Structure

```
src/
├── app/
│   ├── router.tsx          # React Router configuration
│   ├── providers.tsx       # App-level providers (QueryClient, theme, etc.)
│
├── features/
│   ├── auth/
│   │   ├── api.ts          # Auth API hooks (login, register, profile)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │
│   ├── projects/
│   │   ├── pages/
│   │   │   ├── ProjectsListPage.tsx
│   │   │   ├── ProjectDetailsPage.tsx
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/
│   │   ├── AppLayout.tsx   # Main app layout with sidebar & navbar
│   │   ├── ProtectedRoute.tsx # Auth route wrapper
│
├── lib/
│   ├── axios.ts            # Axios instance with interceptors
│   ├── queryClient.ts      # React Query configuration
│   ├── utils.ts            # Utility functions (cn, etc.)
│
├── stores/
│   ├── auth.store.ts       # Zustand auth store
│
├── styles/
│   ├── globals.css         # Tailwind + CSS variables
│
├── main.tsx                # App entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Authentication Flow

The application uses HTTP-only cookie-based authentication:

1. **Initial Load**: `checkAuth()` is called on app mount to verify existing session
2. **Login/Register**: Credentials are sent to backend, which sets HTTP-only cookie
3. **Protected Routes**: `ProtectedRoute` wrapper checks auth state before rendering
4. **401 Handling**: Axios interceptor catches 401 responses, clears auth state, and redirects to login
5. **Logout**: Calls backend logout endpoint to clear cookie, then redirects to login

**Important**: No tokens are stored in localStorage or sessionStorage. All authentication relies on HTTP-only cookies managed by the backend.

## Key Features (Phase 1 - Foundation)

✅ Complete TypeScript setup with strict mode
✅ Tailwind CSS with shadcn/ui component system
✅ React Router v6 with protected routes
✅ Zustand store for authentication state
✅ TanStack Query for server state management
✅ Axios instance with request/response interceptors
✅ Cookie-based authentication (no localStorage tokens)
✅ Responsive sidebar layout with collapsible menu
✅ Dark/light theme support via CSS variables
✅ Loading states and error handling
✅ Feature-based folder structure

## Architecture Decisions

### HTTP-Only Cookies

Authentication tokens are stored in HTTP-only cookies by the backend to prevent XSS attacks. The frontend never has direct access to the JWT token.

### Zustand for Auth State

Auth state is global and frequently accessed, making Zustand ideal for this use case. TanStack Query handles all other server state.

### Feature-Based Structure

Code is organized by feature (auth, projects) rather than type (components, hooks) for better scalability.

### Axios Interceptors

Centralized error handling for 401 responses ensures consistent behavior across the app.

## Next Steps (Phase 2+)

- Implement actual business logic for projects, tasks, and subtasks
- Add form validation with React Hook Form + Zod
- Implement real-time updates with WebSockets
- Add toast notifications
- Implement proper error boundaries
- Add loading skeletons for better UX
- Implement theme toggle functionality
- Add comprehensive test coverage

## Contributing

This is Phase 1 - Foundation. Business logic and feature implementation will come in subsequent phases.

## License

Private - KaryaDesk Project Management System
