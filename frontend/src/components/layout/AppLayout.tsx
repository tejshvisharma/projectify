import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useLogoutMutation } from '@/features/auth/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * AppLayout component for protected routes
 * - Includes sidebar with navigation
 * - Top navbar with user info and actions
 * - Renders nested routes via Outlet
 */
export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-primary">Projectify</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 p-4">
          <Link to="/projects">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                !isSidebarOpen && 'justify-center'
              )}
            >
              <FolderKanban className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Projects</span>}
            </Button>
          </Link>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start',
              !isSidebarOpen && 'justify-center'
            )}
            disabled
          >
            <LayoutDashboard className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Button>
        </nav>

        {/* Sidebar Footer - User Info */}
        <div className="border-t p-4">
          {isSidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">
                    {user?.username}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div>
            <h2 className="text-lg font-semibold">Welcome back, {user?.username}</h2>
            <p className="text-sm text-muted-foreground">
              Role: <span className="capitalize">{user?.role}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Placeholder for future actions (notifications, settings, etc.) */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
