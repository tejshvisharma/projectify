import { AlertTriangle, CheckCircle2, Clock3, Layers3 } from 'lucide-react';
import { KpiCard } from './KpiCard';
import type { UserDashboardStats } from '../types/dashboard.types';

interface StatsCardsProps {
  stats: UserDashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const completionRate =
    stats.totalAssigned > 0
      ? Math.round((stats.totalCompleted / stats.totalAssigned) * 100)
      : 0;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="My dashboard KPI cards">
      <KpiCard label="Total Assigned" value={stats.totalAssigned} icon={Layers3} />
      <KpiCard
        label="Completed"
        value={stats.totalCompleted}
        icon={CheckCircle2}
        trend={{ value: completionRate, label: 'completion' }}
      />
      <KpiCard label="Pending" value={stats.totalPending} icon={Clock3} />
      <KpiCard label="Overdue" value={stats.totalOverdue} icon={AlertTriangle} />
    </section>
  );
}
