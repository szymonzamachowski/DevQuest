import { cn } from "@/lib/utils";

export function PhasePlaceholder({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-4">
        <h1 className="font-heading text-4xl tracking-[-0.02em] text-[var(--foreground)]">
          {title}
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(173,198,255,0.25)] to-transparent" />
      </div>
      <div className="dq-card rounded-xl p-6 text-sm text-[var(--muted-foreground)]">
        {description}
      </div>
    </div>
  );
}
