import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  'Unlimited projects',
  'Unlimited tasks & subtasks',
  'Kanban boards with drag & drop',
  'Team collaboration & roles',
  'Comments & @mentions',
  'File attachments',
  'GitHub integration',
  'API access',
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="landing-fade-up text-center space-y-4 mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            Pricing
          </p>
          <h2 className="font-['Sora',ui-sans-serif,system-ui] text-3xl sm:text-4xl font-semibold tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No credit card required. Everything included.
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <div className="landing-fade-up landing-delay-1 relative overflow-hidden rounded-3xl border-2 border-primary/70 bg-card/95 p-8 shadow-[0_18px_46px_hsl(var(--shadow-color)/0.16)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />

            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="px-4 py-1 text-xs font-semibold tracking-wide">
                ✨ Everything Included
              </Badge>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-lg font-bold mb-2">Free Forever</h3>
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground mb-2">/ month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                No credit card required
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="w-full rounded-xl" size="lg" asChild>
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}