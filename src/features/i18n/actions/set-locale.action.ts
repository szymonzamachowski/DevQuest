"use server";

import { cookies } from "next/headers";

import type { Locale } from "@/i18n/request";

const LOCALES = new Set<Locale>(["en", "pl"]);

export async function setLocaleAction(locale: Locale) {
  if (!LOCALES.has(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}
