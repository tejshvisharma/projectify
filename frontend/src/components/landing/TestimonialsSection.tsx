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
    <section className="py-20 sm:py-32 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by teams worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what teams are saying about Projectify.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </p>

              {/* Author */}
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