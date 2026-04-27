import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, CheckCircle2, Globe2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HERO_BULLETS = [
  'Project and Global leaderboards for transparent performance',
  'Activity tracking that captures every project move',
  'Dashboards with analytics and KPI-ready project insights',
  'Kanban, subtasks, and collaboration in one workspace',
];

const HERO_STATS = [
  { label: 'Visibility Layers', value: '3x' },
  { label: 'Key Modules', value: '8+' },
  { label: 'Workflow Focus', value: 'Real-time' },
];

const TREND_BAR_CLASSES = ['h-7', 'h-9', 'h-8', 'h-11', 'h-10', 'h-12', 'h-[54px]', 'h-[62px]'];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      section.style.setProperty('--hero-progress', '0.28');
      section.style.setProperty('--hero-parallax', '0px');
      return;
    }

    let rafId = 0;

    const updateBackgroundProgress = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      const parallax = (0.5 - progress) * 22;

      section.style.setProperty('--hero-progress', progress.toFixed(3));
      section.style.setProperty('--hero-parallax', `${parallax.toFixed(1)}px`);
      rafId = 0;
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateBackgroundProgress);
      }
    };

    scheduleUpdate();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero-transition-root hero-transition-expressive relative overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="hero-gradient-shift" />
        <div className="hero-gradient-fade" />
        <div className="hero-bg-readability" />
        <div className="absolute left-[-10rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-primary/14 blur-3xl" />
        <div className="absolute right-[-8rem] top-[2rem] h-[20rem] w-[20rem] rounded-full bg-accent/12 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <Badge variant="outline" className="landing-fade-up rounded-full border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-primary">
            KaryaDesk for Execution and Visibility
          </Badge>

          <h1 className="landing-fade-up landing-delay-1 mx-auto max-w-5xl font-['Sora',ui-sans-serif,system-ui] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
            Manage projects with live leaderboards, activity intelligence, and analytics that drive output
          </h1>

          <p className="landing-fade-up landing-delay-2 mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            KaryaDesk helps teams plan, execute, and measure delivery from one product workspace, so everyone sees what is moving, who is contributing, and where to improve.
          </p>

          <div className="landing-fade-up landing-delay-3 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {HERO_BULLETS.map((bullet) => (
              <div key={bullet} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {bullet}
              </div>
            ))}
          </div>

          <div className="landing-fade-up landing-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto rounded-xl px-9" asChild>
              <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-xl border-primary/30 bg-background/60 px-9"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          <div className="landing-fade-up landing-delay-4 mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/70 bg-card/85 p-4 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-primary">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="landing-fade-up landing-delay-5 relative mt-14 mx-auto max-w-6xl">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-[0_20px_50px_hsl(var(--shadow-color)/0.2)] backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-border/70 bg-muted/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4">
                  <div className="mx-auto flex h-6 max-w-sm items-center justify-center rounded-md border border-border/70 bg-background/75">
                    <span className="text-xs text-muted-foreground">
                      app.projectify.com/projects/alpha/dashboard
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 bg-background/95 p-5 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="rounded-2xl border border-border/70 bg-card p-4 text-left">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Project Dashboard</p>
                      <p className="text-xs text-muted-foreground">Task flow, velocity, and completion status</p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Live
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Done', value: '38', tone: 'text-emerald-500' },
                      { label: 'In Progress', value: '14', tone: 'text-blue-500' },
                      { label: 'Blocked', value: '3', tone: 'text-amber-500' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-border/70 bg-background/70 p-3">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={`mt-1 text-xl font-semibold ${item.tone}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-8 items-end gap-2">
                    {TREND_BAR_CLASSES.map((barClass) => (
                      <div key={barClass} className="rounded-md bg-primary/15 p-1">
                        <div className={`w-full rounded-sm bg-gradient-to-t from-primary/80 to-accent/70 ${barClass}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <p className="text-sm font-semibold">Leaderboard Snapshot</p>
                    <p className="mt-1 text-xs text-muted-foreground">Project and global ranking visibility</p>
                    <div className="mt-3 space-y-2">
                      {[
                        { icon: Trophy, label: 'Project Leaderboard', value: 'Aarav • 146 pts' },
                        { icon: Globe2, label: 'Global Leaderboard', value: 'Team Nova • 1,842' },
                        { icon: Activity, label: 'Activity Tracking', value: '28 updates in last 24h' },
                      ].map((row) => {
                        const Icon = row.icon;
                        return (
                          <div key={row.label} className="flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs">
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <Icon className="h-3.5 w-3.5 text-primary" />
                              {row.label}
                            </span>
                            <span className="font-medium text-foreground">{row.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <p className="text-sm font-semibold">Why Teams Switch</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {['Faster standups', 'Clear ownership', 'Stronger visibility', 'Predictable delivery'].map((item) => (
                        <div key={item} className="rounded-lg bg-background/70 px-2.5 py-2 text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}