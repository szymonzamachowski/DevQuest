"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PlayDemoButton } from "@/features/auth/components/play-demo-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginSchema } from "@/features/auth/schemas";
import { cn } from "@/lib/utils";

type FormValues = {
  email: string;
  password: string;
};

export function LoginForm({ className }: { className?: string }) {
  const params = useSearchParams();
  const registered = params.get("registered") === "1";
  const [formError, setFormError] = useState<string | null>(null);
  const t = useTranslations("auth");

  const form = useForm<FormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function loginWith(email: string, password: string) {
    setFormError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/app",
    });
    if (res?.error) setFormError(t("invalidCredentials"));
    if (res?.ok && res.url) window.location.assign(res.url);
  }

  return (
    <form
      className={cn("space-y-5", className)}
      onSubmit={form.handleSubmit(async (values) => loginWith(values.email, values.password))}
    >
      {registered ? (
        <div className="border border-[var(--dq-border)] bg-[var(--dq-surface-container-low)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
          {t("registeredHint")}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-[var(--dq-error)]">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-[var(--dq-error)]">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      {formError ? <p className="text-sm text-[var(--dq-error)]">{formError}</p> : null}

      <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting}>
        {t("submitLogin")}
      </Button>

      <PlayDemoButton variant="outline" size="default" className="h-11 w-full" />
    </form>
  );
}
