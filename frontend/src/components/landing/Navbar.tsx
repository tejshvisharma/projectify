import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Analytics', href: '#insights' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Tech Stack', href: '#tech-stack' },
];

export default function Navbar({ isDark, toggleTheme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6 landing-fade-up">
      <div className="mx-auto max-w-7xl rounded-2xl border border-border/70 bg-background/80 shadow-[0_10px_30px_hsl(var(--shadow-color)/0.12)] backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-3 sm:px-5">

          <Link to="/" className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-105">
              <FolderKanban className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-['Sora',ui-sans-serif,system-ui] text-lg font-semibold tracking-tight">
              Projectify
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-background/70 p-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-xl border border-border/70"
            >
              {isDark
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" className="rounded-xl px-4" asChild>
                <Link to="/register">Get Started Free</Link>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl border border-border/70 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen
                ? <X className="h-4 w-4" />
                : <Menu className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-1 border-t px-3 py-4 md:hidden">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="rounded-xl" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" className="rounded-xl" asChild>
                <Link to="/register">Get Started Free</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}