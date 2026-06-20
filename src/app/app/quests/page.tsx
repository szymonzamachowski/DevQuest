import { redirectToProjectRoute } from "@/lib/redirect-project-route";
import { requireAuth } from "@/lib/require-auth";

export default async function QuestsRedirectPage() {
  const session = await requireAuth();
  await redirectToProjectRoute(session.user.id, "/quests");
}
