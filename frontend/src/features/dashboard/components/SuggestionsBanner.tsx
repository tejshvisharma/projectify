import { AlertCircle, AlertTriangle, Lightbulb, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SuggestionsBannerProps {
  suggestions: string[];
}

function getSuggestionTone(message: string): 'error' | 'warning' | 'info' {
  const normalized = message.toLowerCase();

  if (normalized.includes('overdue') || normalized.includes('urgent')) {
    return 'error';
  }

  if (normalized.includes('due in the next') || normalized.includes('waiting for review')) {
    return 'warning';
  }

  return 'info';
}

export function SuggestionsBanner({ suggestions }: SuggestionsBannerProps) {
  if (!suggestions.length) {
    return null;
  }

  return (
    <section aria-label="Suggestions">
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
            Focus suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          {suggestions.map((suggestion, index) => {
            const tone = getSuggestionTone(suggestion);

            const chipClassName = cn(
              'inline-flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
              tone === 'error' && 'border-destructive/35 bg-destructive/[0.06] text-destructive',
              tone === 'warning' && 'border-amber-300/60 bg-amber-50/90 text-amber-900 dark:border-amber-700/70 dark:bg-amber-950/25 dark:text-amber-100',
              tone === 'info' && 'border-primary/20 bg-primary/[0.06] text-foreground',
            );

            if (tone === 'error') {
              return (
                <div key={`${suggestion}-${index}`} className={chipClassName}>
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p className="max-w-[60ch] leading-5">{suggestion}</p>
                </div>
              );
            }

            if (tone === 'warning') {
              return (
                <div key={`${suggestion}-${index}`} className={chipClassName}>
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                  <p className="max-w-[60ch] leading-5">{suggestion}</p>
                </div>
              );
            }

            return (
              <div key={`${suggestion}-${index}`} className={chipClassName}>
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <p className="max-w-[60ch] leading-5">{suggestion}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
