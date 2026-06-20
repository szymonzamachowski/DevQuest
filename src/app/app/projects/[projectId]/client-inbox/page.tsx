import { notFound } from "next/navigation";

import { ClientInboxView } from "@/features/client-inbox/components/client-inbox-view";
import { getClientInbox } from "@/features/client-inbox/queries/inbox";
import { requireAuth } from "@/lib/require-auth";

export default async function ProjectClientInboxPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requireAuth();
  const data = await getClientInbox(projectId, session.user.id);
  if (!data) notFound();

  return (
    <ClientInboxView
      projectId={projectId}
      events={data.events}
      unreadCount={data.unreadCount}
      isLeader={data.isLeader}
      isSolo={data.mode === "SOLO"}
    />
  );
}
