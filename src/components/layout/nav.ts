import {
  Activity,
  Award,
  FileText,
  Inbox,
  LayoutDashboard,
  Map,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export type AppNavItem = {
  href: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
};

export function getProjectNavItems(projectId: string): AppNavItem[] {
  return [
    { href: `/app/projects/${projectId}`, labelKey: "overview", icon: LayoutDashboard },
    { href: `/app/projects/${projectId}/quests`, labelKey: "questBoard", icon: FileText },
    { href: `/app/projects/${projectId}/roadmap`, labelKey: "roadmap", icon: Map },
    { href: `/app/projects/${projectId}/team`, labelKey: "team", icon: Users },
    { href: `/app/projects/${projectId}/client-inbox`, labelKey: "clientInbox", icon: Inbox },
    { href: `/app/projects/${projectId}/activity`, labelKey: "activity", icon: Activity },
    { href: `/app/projects/${projectId}/achievements`, labelKey: "achievements", icon: Award },
    { href: `/app/projects/${projectId}/report`, labelKey: "finalReport", icon: FileText },
  ];
}

export const appNavItems: AppNavItem[] = [
  { href: "/app", labelKey: "overview", icon: LayoutDashboard },
  { href: "/app/campaigns", labelKey: "campaigns", icon: FileText },
];

export const appBottomItems: AppNavItem[] = [
  { href: "/app/profile", labelKey: "profile", icon: User },
  { href: "/app/settings", labelKey: "settings", icon: Settings },
];
