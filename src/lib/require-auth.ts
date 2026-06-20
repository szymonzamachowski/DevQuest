import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { getAuthOptions } from "@/lib/auth";

export async function requireAuth() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) redirect("/login");
  return session;
}
