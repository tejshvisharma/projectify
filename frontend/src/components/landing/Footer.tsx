import { Link } from 'react-router-dom';
import { FolderKanban, Github } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Analytics', href: '#insights' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Tech Stack', href: '#tech-stack' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Register', href: '/register' },
  ],
  Legal: [
    { label: 'Privacy', href: 'https://github.com/tejshvisharma/projectify' },
    { label: 'Terms', href: 'https://github.com/tejshvisharma/projectify' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-background/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-5">

          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30">
                <FolderKanban className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-['Sora',ui-sans-serif,system-ui] text-lg font-semibold">KaryaDesk</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A full-stack project management platform built with
              React, Node.js, and MongoDB. Open source and free forever.
            </p>
            <a
              href="https://github.com/tejshvisharma/projectify"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="space-y-3">
              <h4 className="text-sm font-semibold">{group}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() =>
                          document
                            .querySelector(link.href)
                            ?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} KaryaDesk. Built as an open source project.
          </p>
          <p className="text-xs text-muted-foreground">
            Full Stack · React + Node.js + MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}