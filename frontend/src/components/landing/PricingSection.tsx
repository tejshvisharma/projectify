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
    <section id="pricing" className="py-20 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No credit card required. Everything included.
          </p>
        </div>

        {/* Single pricing card — centered */}
        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-xl">

            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="px-4 py-1 text-xs font-semibold">
                ✨ Everything Included
              </Badge>
            </div>

            {/* Plan name + price */}
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

            {/* Features list */}
            <ul className="space-y-3 mb-8">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button className="w-full" size="lg" asChild>
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}