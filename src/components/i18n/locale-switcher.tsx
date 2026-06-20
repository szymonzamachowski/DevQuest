"use client";

import { useTransition } from "react";

import type { Locale } from "@/i18n/request";
import { setLocaleAction } from "@/features/i18n/actions/set-locale.action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "pl", label: "PL" },
];

export function LocaleSwitcher({ value }: { value: Locale }) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending} className="h-9 px-3">
          {value.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-20">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.id}
            onClick={() => startTransition(() => void setLocaleAction(l.id))}
            className={l.id === value ? "text-primary" : undefined}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
