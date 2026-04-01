import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Engineering Manager at TechCorp',
    initials: 'SC',
    rating: 5,
    quote:
      'Projectify transformed how our engineering team tracks work. The Kanban board with drag-and-drop is incredibly smooth and the role-based permissions are exactly what we needed.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Lead at StartupXYZ',
    initials: 'MJ',
    rating: 5,
    quote:
      'Finally a project tool that doesn\'t require a 3-day onboarding. Our team was up and running in an hour. The @mention system in notes keeps everyone aligned.',
  },
  {
    name: 'Priya Patel',
    role: 'Scrum Master at DevAgency',
    initials: 'PP',
    rating: 5,
    quote:
      'The subtasks and progress tracking features are outstanding. We replaced three different tools with Projectify and our team productivity improved significantly.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="landing-fade-up text-center space-y-4 mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            Testimonials
          </p>
          <h2 className="font-['Sora',ui-sans-serif,system-ui] text-3xl sm:text-4xl font-semibold tracking-tight">
            Loved by teams worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by engineering and product teams building quickly without losing visibility.
          </p>
        </div>

        <div className="landing-fade-up mb-10 grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 text-center text-xs text-muted-foreground sm:grid-cols-4 sm:text-sm">
          <div className="rounded-xl bg-background/70 py-3">99.95% uptime</div>
          <div className="rounded-xl bg-background/70 py-3">12k+ tasks/week</div>
          <div className="rounded-xl bg-background/70 py-3">500+ active teams</div>
          <div className="rounded-xl bg-background/70 py-3">4.9/5 avg rating</div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="landing-fade-up flex flex-col rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_14px_30px_hsl(var(--shadow-color)/0.14)]"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="mb-6 flex-1 text-sm text-muted-foreground leading-relaxed">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}