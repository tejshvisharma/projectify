import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeaderboardPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function LeaderboardPagination({
  page,
  limit,
  total,
  onPrev,
  onNext,
}: LeaderboardPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onPrev} disabled={!hasPrevPage}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <Button variant="outline" onClick={onNext} disabled={!hasNextPage}>
        Next
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}