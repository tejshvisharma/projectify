import {
  Activity,
  BarChart3,
  ChevronRight,
  Globe2,
  Kanban,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Trophy,
  Users,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Trophy,
    title: 'Project Leaderboard',
    description:
      'Measure project-level contributions and spotlight execution using transparent rankings tied to real task progress.',
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
  },
  {
    icon: Globe2,
    title: 'Global Leaderboard',
    description:
      'Compare performance across projects and teams with a company-wide view of momentum, quality, and consistency.',
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
  },
  {
    icon: Activity,
    title: 'Activity Tracking',
    description:
      'Track what changed, who moved it, and when it happened with timeline-friendly activity updates for each project.',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    icon: LayoutDashboard,
    title: 'Project Dashboard',
    description:
      'View KPIs, task status distribution, and recent activity in one dashboard built for fast daily decision-making.',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description:
      'Use trends and throughput summaries to identify blockers early and keep your sprint outcomes predictable.',
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40',
  },
  {
    icon: Kanban,
    title: 'Kanban Workflow',
    description:
      'Run planning and execution on drag-and-drop boards with status-aware lanes and seamless updates.',
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Invite members by role, coordinate with comments, and keep every contributor aligned around clear priorities.',
    color: 'text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/40',
  },
  {
    icon: MessageSquare,
    title: 'Comments & Notes',
    description:
      'Capture decisions inside tasks and notes with @mentions so context is never lost across handoffs.',
    color: 'text-lime-500 bg-lime-50 dark:bg-lime-950/40',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Fine-grained permissions with Owner, Admin, Member, and Viewer roles. Control who can do what.',
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40',
  },
];

const CORE_VALUE_CHIPS = [
  'Project visibility in one glance',
  'Leaderboard-driven accountability',
  'Analytics-backed delivery planning',
  'Activity-first collaboration flow',
];

export default function FeaturesSection() {
  const coreFeatures = FEATURES.slice(0, 5);
  const workflowFeatures = FEATURES.slice(5);

  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="landing-fade-up text-center space-y-4 mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            Features
          </p>
          <h2 className="font-['Sora',ui-sans-serif,system-ui] text-3xl sm:text-4xl font-semibold tracking-tight">
            Built for delivery, visibility, and accountability
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Core platform capabilities arranged to help teams execute quickly while staying measurable.
          </p>
        </div>

        <div className="landing-fade-up landing-delay-1 mb-10 flex flex-wrap items-center justify-center gap-2">
          {CORE_VALUE_CHIPS.map((chip) => (
            <span key={chip} className="rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground sm:text-sm">
              {chip}
            </span>
          ))}
        </div>

        <div className="mb-12">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Core Visibility Suite</h3>
            <p className="hidden text-sm text-muted-foreground md:block">The fastest way to understand project health and team output</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="landing-fade-up group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_36px_hsl(var(--shadow-color)/0.14)]"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/8 blur-2xl transition-opacity group-hover:bg-primary/15" />

                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mb-2 text-base font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Explore value
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Execution Toolkit</h3>
            <p className="hidden text-sm text-muted-foreground md:block">Everything teams need to run work from planning to delivery</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {workflowFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="landing-fade-up landing-delay-1 group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_36px_hsl(var(--shadow-color)/0.14)]"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/8 blur-2xl transition-opacity group-hover:bg-primary/15" />

                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mb-2 text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Learn more
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}