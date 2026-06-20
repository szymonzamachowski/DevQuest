function Pulse({ className }: { className: string }) {
  return <div className={`bg-muted animate-pulse rounded-md ${className}`} />;
}

export default function CampaignDetailLoading() {
  return (
    <div className="space-y-8">
      <Pulse className="h-5 w-32" />
      <div className="space-y-4">
        <Pulse className="h-12 w-2/3" />
        <Pulse className="h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Pulse className="h-48 rounded-xl lg:col-span-2" />
        <Pulse className="h-48 rounded-xl" />
      </div>
      <Pulse className="h-64 w-full rounded-xl" />
    </div>
  );
}
