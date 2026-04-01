import { Activity, BarChart3, Globe2, Sparkles, Trophy } from 'lucide-react';

export default function InsightsSection() {
  const trendBarHeights = ['h-6', 'h-8', 'h-7', 'h-11', 'h-10', 'h-12', 'h-14', 'h-[52px]', 'h-[60px]', 'h-[68px]', 'h-[64px]', 'h-[72px]'];

  return (
    <section id="insights" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="landing-fade-up text-center space-y-4 mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            Analytics & Leaderboards
          </p>
          <h2 className="font-['Sora',ui-sans-serif,system-ui] text-3xl sm:text-4xl font-semibold tracking-tight">
            Performance signals your team can act on quickly
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dedicated visibility into contribution, momentum, and project health across both local and global views.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="landing-fade-up rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_14px_34px_hsl(var(--shadow-color)/0.14)]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Leaderboard Highlights</h3>
                  <p className="text-xs text-muted-foreground">Project and global performance at a glance</p>
                </div>
              </div>

              <div className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-xs text-muted-foreground">
                Weekly cycle
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="mb-3 text-sm font-medium">Project Leaderboard</p>
                {[
                  { name: 'Aarav', points: '146' },
                  { name: 'Mia', points: '139' },
                  { name: 'Leo', points: '128' },
                ].map((item, index) => (
                  <div key={item.name} className="mb-2 flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs last:mb-0">
                    <span>{index + 1}. {item.name}</span>
                    <span className="font-semibold text-primary">{item.points} pts</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="mb-3 text-sm font-medium">Global Leaderboard</p>
                {[
                  { name: 'Team Nova', score: '1,842' },
                  { name: 'Team Orbit', score: '1,796' },
                  { name: 'Team Pulse', score: '1,710' },
                ].map((item, index) => (
                  <div key={item.name} className="mb-2 flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs last:mb-0">
                    <span>{index + 1}. {item.name}</span>
                    <span className="font-semibold text-accent">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="landing-fade-up landing-delay-1 rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_14px_34px_hsl(var(--shadow-color)/0.14)]">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950/40">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Analytics & Activity</h3>
                <p className="text-xs text-muted-foreground">Real-time tracking with trend visibility</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Velocity', value: '+18%' },
                { label: 'Cycle Time', value: '-12%' },
                { label: 'Completion', value: '87%' },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <p className="text-[11px] text-muted-foreground">{metric.label}</p>
                  <p className="text-lg font-semibold text-primary">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 items-end gap-2 rounded-2xl border border-border/70 bg-background/70 p-3">
              {trendBarHeights.map((barClass, index) => (
                <div key={barClass + index} className="rounded bg-primary/10 p-0.5">
                  <div className={`w-full rounded-sm bg-gradient-to-t from-primary/80 to-accent/70 ${barClass}`} />
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2">
                <Activity className="h-3.5 w-3.5 text-primary" />
                Activity tracking timeline
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2">
                <Globe2 className="h-3.5 w-3.5 text-accent" />
                Multi-project benchmarking
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 sm:col-span-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Insight-ready summaries for weekly planning reviews
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}