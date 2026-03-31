import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban,
  Menu, Sun, Moon, User, LogOut, Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useLogoutMutation } from '@/features/auth/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThemeStore } from '@/stores/theme.store';

// ── Nav link config ────────────────────────────────────────────────────────────
const NAV_LINKS = [
  {
    to: '/projects',
    label: 'Projects',
    icon: FolderKanban,
    enabled: true,
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    enabled: false, // disabled until built
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    enabled: true,
  },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const { isDark, toggleTheme } = useThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed z-40 top-0 left-0 h-full flex flex-col border-r bg-card transition-all duration-300',

          // Desktop behavior
          'md:static md:translate-x-0',
          isSidebarOpen ? 'md:w-64' : 'md:w-16',

          // Mobile behavior
          'w-64',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b px-3">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-primary ml-1">Projectify</h1>
          )}

          <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen((v) => !v)}
          className={cn(
            'shrink-0 hidden md:flex',
            isSidebarOpen ? 'ml-auto' : 'mx-auto'
          )}
        >
          <Menu className="h-5 w-5" />
        </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-2 pt-3">
          <TooltipProvider delayDuration={0}>
            {NAV_LINKS.map(({ to, label, icon: Icon, enabled }) => {
              const isActive = location.pathname.startsWith(to);

              const button = (
                <Button
                  key={to}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full transition-all',
                    isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0',
                    !enabled && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={!enabled}
                  asChild={enabled}
                >
                  {enabled ? (
                    <Link to={to}
                      className="flex items-center gap-3"
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {isSidebarOpen && <span>{label}</span>}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      {isSidebarOpen && <span>{label}</span>}
                    </div>
                  )}
                </Button>
              );

              // Show tooltip only when collapsed
              if (!isSidebarOpen) {
                return (
                  <Tooltip key={to}>
                    <TooltipTrigger asChild>
                      <div>{button}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </TooltipProvider>
        </nav>

      </aside>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">

          <div className="flex items-center gap-2">

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <h2 className="text-sm md:text-lg font-semibold truncate">
              Welcome back, {user?.username}
            </h2>
          </div>

          <div className="flex items-center gap-3">

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9"
            >
              {isDark
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </Button>

            {/* User dropdown */}
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

                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4 shrink-0" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

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
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
