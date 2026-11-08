import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "pl"] as const;
export type Locale = (typeof locales)[number];

const DEFAULT_LOCALE: Locale = "en";

function coerceLocale(value: string | undefined): Locale {
  if (value === "pl" || value === "en") return value;
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = coerceLocale(cookieStore.get("locale")?.value);
  const messages = (await import(`../messages/${locale}.json`)).default;
  return {
    locale,
    messages,
    // A fixed zone keeps server- and client-rendered dates identical (no hydration mismatch).
    timeZone: "Europe/Warsaw",
    formats: {
      dateTime: {
        date: { dateStyle: "medium" },
        dateTime: { dateStyle: "medium", timeStyle: "short" },
      },
    },
  };
});
