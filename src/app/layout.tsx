import type { Metadata } from "next";
import { Jacquarda_Bastarda_9, Jersey_10 } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

// Pixel blackletter for titles, a readable pixel sans for everything else.
const display = Jacquarda_Bastarda_9({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

const pixel = Jersey_10({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: { default: "DevQuest", template: "%s · DevQuest" },
  description:
    "Run a real software project like a campaign: quests, code review, client decisions and a portfolio-ready final report.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${display.variable} ${pixel.variable} dark h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-[var(--dq-gold)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--dq-ink)]"
        >
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
