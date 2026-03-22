import {
  Kanban, Users, MessageSquare, CheckSquare,
  Bell, Shield,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Kanban,
    title: 'Kanban Boards',
    description:
      'Visualize your workflow with drag-and-drop Kanban boards. Move tasks between columns instantly with optimistic updates.',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Invite members with role-based access control. Assign tasks, manage permissions, and work together seamlessly.',
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
  },
  {
    icon: MessageSquare,
    title: 'Comments & Notes',
    description:
      'Discuss tasks inline with threaded comments. Write project notes with @mention support to notify teammates.',
    color: 'text-green-500 bg-green-50 dark:bg-green-950',
  },
  {
    icon: CheckSquare,
    title: 'Subtasks & Checklists',
    description:
      'Break down complex tasks into manageable subtasks. Track progress with visual completion indicators.',
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  },
  {
    icon: Bell,
    title: '@Mentions',
    description:
      'Tag team members in notes and comments. Everyone stays informed about what matters to them.',
    color: 'text-pink-500 bg-pink-50 dark:bg-pink-950',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Fine-grained permissions with Owner, Admin, Member, and Viewer roles. Control who can do what.',
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything your team needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete project management suite built for modern
            development teams.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}