import Link from "next/link";
import { useTranslations } from "next-intl";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <div className="mx-auto grid w-full max-w-[480px] gap-6">
      <div className="dq-card rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo label={t("common.appName")} />
          <Button asChild variant="ghost" className="h-9">
            <Link href="/register">{t("auth.registerTitle")}</Link>
          </Button>
        </div>
        <h1 className="font-heading text-2xl tracking-tight text-[var(--foreground)]">
          {t("auth.loginTitle")}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Use your credentials to access the workspace.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
