import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth Pages
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '@/features/auth/pages/VerifyEmailPage';
import ResendVerificationEmailPage from '@/features/auth/pages/ResendVerificationEmailPage';

// Project Pages
import ProjectsListPage from '@/features/projects/pages/ProjectsListPage';
import ProjectDetailsPage from '@/features/projects/pages/ProjectDetailsPage';
import ProjectDashboardPage from '@/features/dashboard/pages/ProjectDashboardPage';
import GlobalLeaderboardPage from '@/features/projects/pages/GlobalLeaderboardPage';
import ProfilePage from '@/features/auth/pages/ProfilePage';
import LandingPage from '@/pages/LandingPage';
import { PublicRoute } from '@/components/layout/PublicRoute';

/**
 * Application routing configuration using React Router v6
 * - Public routes: /login, /register
 * - Protected routes: /projects, /projects/:projectId (wrapped in ProtectedRoute)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/resend-verification-email',
    element: <ResendVerificationEmailPage />,
  },
  {
    element: <PublicRoute />,
    children: [

  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
    ],
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
          {
            path: '/projects/:projectId/dashboard',
            element: <ProjectDashboardPage />,
          },
          {
            path: '/leaderboard',
            element: <GlobalLeaderboardPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          }
        ],
      },
    ],
  },
]);
