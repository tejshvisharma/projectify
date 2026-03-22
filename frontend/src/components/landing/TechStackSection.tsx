const TECH_STACK = [
  { name: 'React 18',       color: 'text-cyan-500',   bg: 'bg-cyan-50 dark:bg-cyan-950'     },
  { name: 'TypeScript',     color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950'     },
  { name: 'Node.js',        color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950'   },
  { name: 'Express.js',     color: 'text-gray-600',   bg: 'bg-gray-100 dark:bg-gray-800'    },
  { name: 'MongoDB',        color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950'   },
  { name: 'TanStack Query', color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950'       },
  { name: 'Zustand',        color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  { name: 'Tailwind CSS',   color: 'text-sky-500',    bg: 'bg-sky-50 dark:bg-sky-950'       },
  { name: 'shadcn/ui',      color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950' },
  { name: '@dnd-kit',       color: 'text-pink-500',   bg: 'bg-pink-50 dark:bg-pink-950'     },
  { name: 'Axios',          color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
  { name: 'JWT + Cookies',  color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
];

export default function TechStackSection() {
  return (
    <section id="tech-stack" className="py-20 sm:py-32 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">
            Tech Stack
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built with modern technologies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Production-grade tools used by top engineering teams worldwide.
          </p>
        </div>

        {/* Tech badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full
                border font-medium text-sm transition-all duration-200
                hover:scale-105 hover:shadow-md cursor-default
                ${tech.bg} ${tech.color}
              `}
            >
              <div className={`h-2 w-2 rounded-full ${tech.color.replace('text-', 'bg-')}`} />
              {tech.name}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}