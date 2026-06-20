import { AlertCircle, Inbox, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-[var(--muted-foreground)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-6 w-6 animate-spin text-[var(--dq-primary)]" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-6", className)} aria-hidden>
      <div className="h-10 w-64 rounded-lg bg-[var(--dq-surface-container-high)]" />
      <div className="h-32 rounded-xl bg-[var(--dq-surface-container-high)]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-xl bg-[var(--dq-surface-container-high)]" />
        <div className="h-40 rounded-xl bg-[var(--dq-surface-container-high)]" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="dq-card flex flex-col items-center rounded-xl px-6 py-12 text-center">
      <Inbox className="mb-4 h-10 w-10 text-[var(--muted-foreground)]" aria-hidden />
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="dq-card flex flex-col items-center rounded-xl px-6 py-12 text-center"
      role="alert"
    >
      <AlertCircle className="mb-4 h-10 w-10 text-[var(--dq-error)]" aria-hidden />
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">{description}</p>
      ) : null}
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry} type="button">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
