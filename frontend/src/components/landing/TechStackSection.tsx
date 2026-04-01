const TECH_STACK = [
  { name: 'React 18', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
  { name: 'TypeScript', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { name: 'Node.js', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/40' },
  { name: 'Express.js', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800/80' },
  { name: 'MongoDB', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/40' },
  { name: 'TanStack Query', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
  { name: 'Zustand', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
  { name: 'Tailwind CSS', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/40' },
  { name: 'shadcn/ui', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40' },
  { name: '@dnd-kit', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/40' },
  { name: 'Axios', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  { name: 'JWT + Cookies', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/40' },
];

export default function TechStackSection() {
  return (
    <section id="tech-stack" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="landing-fade-up text-center space-y-4 mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            Tech Stack
          </p>
          <h2 className="font-['Sora',ui-sans-serif,system-ui] text-3xl sm:text-4xl font-semibold tracking-tight">
            Built with modern technologies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Production-grade tools used by top engineering teams worldwide.
          </p>
        </div>

        <div className="landing-fade-up landing-delay-1 rounded-3xl border border-border/70 bg-card/85 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">Frontend</span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">Backend</span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">State & Data</span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">Security</span>
          </div>

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
      </div>
    </section>
  );
}