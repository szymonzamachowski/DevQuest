import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  href = "/",
  size = 32,
  label = "DevQuest",
}: {
  className?: string;
  href?: string;
  size?: number;
  label?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/brand/logo.svg"
        alt=""
        width={size}
        height={size}
        priority
        className="rounded-xl"
        aria-hidden
      />
      <span className="font-semibold tracking-tight">{label}</span>
    </Link>
  );
}
