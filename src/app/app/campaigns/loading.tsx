function Pulse({ className }: { className: string }) {
  return <div className={`bg-muted animate-pulse ${className}`} />;
}

export default function AppCampaignsLoading() {
  return (
    <div className="space-y-6">
      <Pulse className="h-9 w-56" />
      <Pulse className="h-5 w-80" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Pulse key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
