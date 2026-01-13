import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth Pages
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';

// Project Pages
import ProjectsListPage from '@/features/projects/pages/ProjectsListPage';
import ProjectDetailsPage from '@/features/projects/pages/ProjectDetailsPage';

/**
 * Application routing configuration using React Router v6
 * - Public routes: /login, /register
 * - Protected routes: /projects, /projects/:projectId (wrapped in ProtectedRoute)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/projects" replace />,
  },
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/projects',
            element: <ProjectsListPage />,
          },
          {
            path: '/projects/:projectId',
            element: <ProjectDetailsPage />,
          },
        ],
      },
    ],
  },
]);
