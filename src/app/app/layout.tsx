import { AppShellClient } from "@/components/layout/app-shell.client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isGuest: true },
  });

  return (
    <AppShellClient
      user={{
        name: session.user.name,
        email: session.user.email,
        isGuest: account?.isGuest ?? false,
      }}
    >
      {children}
    </AppShellClient>
  );
}
