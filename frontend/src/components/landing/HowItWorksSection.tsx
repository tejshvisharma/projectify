import { UserPlus, FolderPlus, Rocket } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Sign up in seconds. Verify your email and you\'re ready to go. No credit card required.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    step: '02',
    icon: FolderPlus,
    title: 'Set Up Your Project',
    description:
      'Create a project, add team members with appropriate roles, and configure your workflow.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    step: '03',
    icon: Rocket,
    title: 'Start Collaborating',
    description:
      'Create tasks, assign them to teammates, track progress on the Kanban board, and ship faster.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Up and running in minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform how your team manages work.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">

          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-border" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  {/* Step number + icon */}
                  <div className="relative">
                    <div className={`h-16 w-16 rounded-2xl ${step.bg} flex items-center justify-center z-10 relative`}>
                      <Icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
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