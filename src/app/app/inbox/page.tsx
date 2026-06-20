import { redirectToProjectRoute } from "@/lib/redirect-project-route";
import { requireAuth } from "@/lib/require-auth";

export default async function InboxRedirectPage() {
  const session = await requireAuth();
  await redirectToProjectRoute(session.user.id, "/client-inbox");
}
