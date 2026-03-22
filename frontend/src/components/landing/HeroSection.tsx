import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HERO_BULLETS = [
  'Kanban boards with drag & drop',
  'Real-time team collaboration',
  'Task tracking with subtasks',
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">

      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">

          {/* Badge */}
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium">
            🚀 Open Source Project Management
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            Manage Projects Like a{' '}
            <span className="text-primary">Pro Team</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Projectify brings your team together with Kanban boards,
            task management, real-time collaboration, and powerful
            project insights — all in one place.
          </p>

          {/* Bullet points */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {HERO_BULLETS.map((bullet) => (
              <div key={bullet} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {bullet}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto px-8" asChild>
              <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          {/* Product screenshot mockup */}
          <div className="relative mt-16 mx-auto max-w-5xl">
            {/* Glow effect behind screenshot */}
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-3xl" />

            {/* Screenshot container */}
            <div className="relative rounded-2xl border bg-card shadow-2xl overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4">
                  <div className="h-5 rounded-md bg-muted mx-auto max-w-xs flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      app.projectify.com/projects
                    </span>
                  </div>
                </div>
              </div>

              {/* Kanban board mockup */}
              <div className="p-6 bg-background">
                {/* Board header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="h-6 w-48 bg-muted rounded-md mb-2" />
                    <div className="h-4 w-32 bg-muted/60 rounded-md" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-muted rounded-md" />
                    <div className="h-8 w-24 bg-primary/20 rounded-md" />
                  </div>
                </div>

                {/* Three kanban columns */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'To Do',       color: 'bg-slate-100 dark:bg-slate-800',  count: 3 },
                    { label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-950',     count: 2 },
                    { label: 'Done',        color: 'bg-green-50 dark:bg-green-950',   count: 4 },
                  ].map((col) => (
                    <div key={col.label} className={`${col.color} rounded-xl p-3 space-y-2`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold">{col.label}</span>
                        <span className="text-xs bg-background rounded-full px-2 py-0.5">
                          {col.count}
                        </span>
                      </div>
                      {Array.from({ length: col.count }).map((_, i) => (
                        <div key={i} className="bg-background rounded-lg p-3 shadow-sm space-y-2">
                          <div className={`h-3 rounded bg-muted ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`} />
                          <div className="h-2.5 w-1/2 rounded bg-muted/60" />
                          <div className="flex items-center justify-between pt-1">
                            <div className="h-4 w-12 rounded-full bg-primary/20" />
                            <div className="h-5 w-5 rounded-full bg-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}