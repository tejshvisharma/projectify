import { FolderPlus, LineChart, ListChecks, UserPlus } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Sign up in seconds. Verify your email and you\'re ready to go. No credit card required.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  {
    step: '02',
    icon: FolderPlus,
    title: 'Set Up Projects',
    description:
      'Create a project, add team members with appropriate roles, and configure your workflow.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
  },
  {
    step: '03',
    icon: ListChecks,
    title: 'Execute and Track',
    description:
      'Run work through Kanban columns, subtasks, and activity logs while keeping everyone aligned.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    step: '04',
    icon: LineChart,
    title: 'Review Insights',
    description:
      'Use dashboard analytics and project or global leaderboards to improve planning and outcomes.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="landing-fade-up text-center space-y-4 mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            How It Works
          </p>
          <h2 className="font-['Sora',ui-sans-serif,system-ui] text-3xl sm:text-4xl font-semibold tracking-tight">
            Up and running in minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple workflow from setup to measurable performance.
          </p>
        </div>

        <div className="relative rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="pointer-events-none absolute left-8 right-8 top-[4.7rem] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent xl:block" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="landing-fade-up group rounded-2xl border border-border/60 bg-background/65 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mx-auto mb-4 flex items-center justify-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {step.step}
                    </span>
                  </div>

                  <div className="relative mx-auto mb-4">
                    <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg}`}>
                      <Icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mx-auto max-w-xs text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}