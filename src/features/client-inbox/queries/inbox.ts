import { prisma } from "@/lib/db";

export async function getClientInbox(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { project: { select: { mode: true } } },
  });
  if (!membership) return null;

  const events = await prisma.projectClientEvent.findMany({
    where: { projectId },
    orderBy: [{ status: "asc" }, { triggeredAt: "desc" }],
    include: {
      clientEventTemplate: {
        include: { options: { orderBy: { healthImpact: "asc" } } },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
      selectedOption: true,
    },
  });

  const unreadCount = events.filter((e) => !e.isRead && e.status === "PENDING").length;

  return {
    events,
    unreadCount,
    membership,
    isLeader: membership.role === "LEADER",
    mode: membership.project.mode,
  };
}

export async function getClientEventDetail(projectId: string, eventId: string, userId: string) {
  const inbox = await getClientInbox(projectId, userId);
  if (!inbox) return null;
  const event = inbox.events.find((e) => e.id === eventId);
  if (!event) return null;
  return { ...inbox, event };
}
