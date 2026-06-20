import Link from "next/link";
import { useTranslations } from "next-intl";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  const t = useTranslations();

  return (
    <div className="mx-auto grid w-full max-w-[520px] gap-6">
      <div className="dq-card rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo size={28} label={t("common.appName")} />
          <Button asChild variant="ghost" className="h-9">
            <Link href="/login">{t("auth.loginTitle")}</Link>
          </Button>
        </div>
        <h1 className="font-heading text-2xl tracking-tight text-[var(--foreground)]">
          {t("auth.registerTitle")}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Credentials auth for the MVP. You can change this later.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
