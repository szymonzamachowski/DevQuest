"use client";

import { ErrorState } from "@/components/ui/page-states";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Workspace error"
      description={error.message || "Unable to load this workspace view."}
      onRetry={reset}
    />
  );
}
