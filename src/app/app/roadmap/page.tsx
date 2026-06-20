import { redirectToProjectRoute } from "@/lib/redirect-project-route";
import { requireAuth } from "@/lib/require-auth";

export default async function RoadmapRedirectPage() {
  const session = await requireAuth();
  await redirectToProjectRoute(session.user.id, "/roadmap");
}
