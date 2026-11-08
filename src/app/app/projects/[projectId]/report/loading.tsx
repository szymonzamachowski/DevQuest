export default function ReportLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 bg-[var(--dq-surface-container-high)]" />
      <div className="h-32 bg-[var(--dq-surface-container-high)]" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-24 bg-[var(--dq-surface-container-high)]" />
        <div className="h-24 bg-[var(--dq-surface-container-high)]" />
        <div className="h-24 bg-[var(--dq-surface-container-high)]" />
      </div>
    </div>
  );
}
