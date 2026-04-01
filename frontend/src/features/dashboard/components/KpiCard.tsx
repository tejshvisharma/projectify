import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KpiTrend {
  value: number;
  label: string;
}

interface KpiCardProps {
  label: string;
  value: number;
  icon?: LucideIcon;
  trend?: KpiTrend;
  isLoading?: boolean;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-border/70">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
    );
  }

  const formattedValue = value.toLocaleString('en-US');
  const hasTrend = typeof trend?.value === 'number';
  const isPositiveTrend = (trend?.value ?? 0) >= 0;

  return (
    <Card className="overflow-hidden border-border/70 bg-gradient-to-b from-card to-card/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon ? (
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
          ) : null}
        </div>

        <p className="text-3xl font-semibold tracking-tight">{formattedValue}</p>

        {hasTrend ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              isPositiveTrend
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
            )}
          >
            {isPositiveTrend ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{Math.abs(trend?.value ?? 0)}%</span>
            <span className="text-current/85">{trend?.label}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Updated with the latest project data.</p>
        )}
      </CardContent>
    </Card>
  );
}
