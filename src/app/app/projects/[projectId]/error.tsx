"use client";

import { ErrorState } from "@/components/ui/page-states";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Project error"
      description={error.message || "Unable to load this project."}
      onRetry={reset}
    />
  );
}
