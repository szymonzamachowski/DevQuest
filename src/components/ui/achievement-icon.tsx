import {
  Award,
  Bug,
  CircleCheck,
  Flag,
  Handshake,
  Rocket,
  Scale,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** Achievements store a lucide icon name (see prisma/seed.ts); unknown names fall back to a medal. */
const icons: Record<string, LucideIcon> = {
  bug: Bug,
  "check-circle": CircleCheck,
  flag: Flag,
  handshake: Handshake,
  rocket: Rocket,
  scale: Scale,
  shield: Shield,
  users: Users,
};

export function AchievementIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Award;
  return <Icon aria-hidden className={cn("size-7", className)} strokeWidth={2.5} />;
}
