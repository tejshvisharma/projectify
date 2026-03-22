import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30 border-t">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Ready to ship faster?
        </h2>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Join teams already using Projectify to manage their projects,
          track tasks, and collaborate without the chaos.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto px-10" asChild>
            <Link to="/register">
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-10"
            asChild
          >
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          No credit card required · Free forever · Open source
        </p>

      </div>
    </section>
  );
}