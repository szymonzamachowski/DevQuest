import { getLocale } from "next-intl/server";

import type { Locale } from "@/i18n/request";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";

export async function LocaleSwitcherServer() {
  const locale = (await getLocale()) as Locale;
  return <LocaleSwitcher value={locale} />;
}
