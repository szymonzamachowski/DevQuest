"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { startDemoAction } from "@/features/auth/actions/demo.action";

/** Starts a private demo sandbox and signs the visitor in as its guest leader. */
export function PlayDemoButton({
  className,
  variant = "default",
  size = "lg",
}: {
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "lg";
}) {
  const t = useTranslations("demo");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        data-testid="play-demo"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await startDemoAction();
            if (!result.ok) {
              setError(t(`errors.${result.error}`));
              return;
            }
            const login = await signIn("guest", { token: result.token, redirect: false });
            if (!login?.ok) {
              setError(t("errors.UNAVAILABLE"));
              return;
            }
            window.location.assign(`/app/projects/${result.projectId}`);
          })
        }
      >
        {pending ? t("preparing") : t("play")}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-[var(--dq-blood)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
