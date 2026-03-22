import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useLogoutMutation } from '@/features/auth/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
            <div className="w-full">
              <div className="flex items-center space-x-3">
                <Link
                to="/profile"
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  hover:bg-muted/50 transition-colors group
                  ${location.pathname === '/profile' ? 'bg-muted' : ''}
                `}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user?.avatar?.url} />
                  <AvatarFallback className="text-xs font-semibold">
                    {user?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-none">
                    {user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </Link>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Open user menu"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage src={user?.avatar?.url} />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {user?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">

              {/* User info header — not clickable */}
              <div className="flex items-center gap-3 px-3 py-3 border-b">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={user?.avatar?.url} />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {user?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              {/* View Profile */}
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
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
