import { Link } from 'react-router-dom';
import { FolderKanban, Github } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features',    href: '#features'     },
    { label: 'How It Works', href: '#how-it-works'  },
    { label: 'Pricing',     href: '#pricing'      },
    { label: 'Tech Stack',  href: '#tech-stack'   },
  ],
  Account: [
    { label: 'Sign In',     href: '/login'        },
    { label: 'Register',    href: '/register'     },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FolderKanban className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Projectify</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A full-stack project management platform built with
              React, Node.js, and MongoDB. Open source and free forever.
            </p>
            {/* GitHub link */}
            <a
            href="https://github.com/tejshvisharma/projectify"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
            <Github className="h-4 w-4" />
            View on GitHub
            </a>
          </div>

          {/* Link columns */}
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
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} Projectify. Built with ❤️ as an open source project.
          </p>
          <p className="text-xs text-muted-foreground">
            Full Stack · React + Node.js + MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}