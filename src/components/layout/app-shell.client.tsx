"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  appBottomItems,
  appNavItems,
  getProjectNavItems,
  type AppNavItem,
} from "@/components/layout/nav";
import { cn } from "@/lib/utils";

export type AppShellUser = {
  name?: string | null;
  email?: string | null;
};

function initials(nameOrEmail: string | null | undefined) {
  const value = (nameOrEmail || "").trim();
  if (!value) return "U";
  const parts = value.split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return letters.join("") || "U";
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || (!exact && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 px-3 py-2 text-[0.9375rem]",
        "text-[var(--muted-foreground)] hover:bg-[var(--dq-surface-container-high)] hover:text-[var(--foreground)]",
        active &&
          "bg-[var(--dq-surface-container-high)] font-semibold text-[var(--dq-gold)] shadow-[inset_4px_0_0_var(--dq-gold),var(--dq-bevel)]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

function Sidebar({ user, navItems }: { user: AppShellUser; navItems: AppNavItem[] }) {
  const t = useTranslations("navigation");
  const locale = useLocale();

  return (
    <aside
      className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col bg-[var(--dq-surface-dim)] px-4 py-6 shadow-[3px_0_0_var(--dq-ink)] md:flex"
      aria-label={t("sidebar")}
    >
      <div className="px-2">
        <BrandLogo href="/app" />
        <div className="mt-3 text-xs text-[var(--muted-foreground)]">
          {user.name || user.email || "User"}
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label={t("mainNav")}>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={t(item.labelKey)}
            icon={item.icon}
            exact={item.exact}
          />
        ))}
      </nav>

      <div className="mt-4 space-y-2">
        <Separator className="h-[3px] bg-[var(--dq-ink)]" />
        <div className="flex items-center justify-between gap-3 px-2">
          <LocaleSwitcher value={locale === "pl" ? "pl" : "en"} />
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-[var(--dq-surface-container-high)] text-[var(--dq-primary)]">
              {initials(user.name || user.email)}
            </AvatarFallback>
          </Avatar>
        </div>
        <nav aria-label={t("accountNav")}>
          {appBottomItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(item.labelKey)}
              icon={item.icon}
              exact={item.exact}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function MobileDrawer({ navItems }: { navItems: AppNavItem[] }) {
  const t = useTranslations("navigation");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="dq-touch-target h-11 px-3 md:hidden"
          aria-label={t("openMenu")}
        >
          <Menu className="h-4 w-4" aria-hidden />
          <span className="sr-only">{t("openMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(20rem,90vw)] border-[var(--dq-outline-variant)] bg-[var(--dq-surface-dim)] p-4"
      >
        <SheetTitle className="sr-only">{t("openMenu")}</SheetTitle>
        <BrandLogo href="/app" />
        <nav className="mt-6 flex flex-col gap-1" aria-label={t("mainNav")}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(item.labelKey)}
              icon={item.icon}
              exact={item.exact}
            />
          ))}
        </nav>
        <nav className="mt-6 space-y-1" aria-label={t("accountNav")}>
          {appBottomItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(item.labelKey)}
              icon={item.icon}
              exact={item.exact}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

/** The shell renders above the project layout, so it reads the project id from the URL. */
function projectIdFromPath(pathname: string): string | null {
  const match = /^\/app\/projects\/([^/]+)/.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

export function AppShellClient({
  user,
  children,
}: {
  user: AppShellUser;
  children: React.ReactNode;
}) {
  const projectId = projectIdFromPath(usePathname());
  const resolvedNav = projectId ? getProjectNavItems(projectId) : appNavItems;

  return (
    <div className="min-h-dvh md:flex">
      <Sidebar user={user} navItems={resolvedNav} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 bg-[var(--dq-surface-dim)] shadow-[0_3px_0_var(--dq-ink)] md:hidden">
          <div className="flex h-16 items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <MobileDrawer navItems={resolvedNav} />
              {/* Wordmark only where it fits next to the menu and avatar. */}
              <BrandLogo href="/app" className="[&>span]:hidden sm:[&>span]:inline" />
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[var(--dq-surface-container-high)] text-[var(--dq-gold)]">
                {initials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
