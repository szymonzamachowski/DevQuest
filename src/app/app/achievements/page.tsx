import { redirectToProjectRoute } from "@/lib/redirect-project-route";
import { requireAuth } from "@/lib/require-auth";

export default async function AchievementsRedirectPage() {
  const session = await requireAuth();
  await redirectToProjectRoute(session.user.id, "/achievements");
}
