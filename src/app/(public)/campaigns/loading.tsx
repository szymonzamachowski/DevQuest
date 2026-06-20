function Pulse({ className }: { className: string }) {
  return <div className={`bg-muted animate-pulse rounded-md ${className}`} />;
}

export default function CampaignsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Pulse className="h-10 w-72" />
        <Pulse className="h-5 w-96" />
      </div>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-10 w-40" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Pulse key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
