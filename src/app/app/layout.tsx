import { AppShellClient } from "@/components/layout/app-shell.client";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <AppShellClient
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    >
      {children}
    </AppShellClient>
  );
}
