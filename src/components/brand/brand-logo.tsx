import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  href = "/",
  size = 51, // the sprite is 51x51: whole-pixel scale keeps it crisp
  label = "DevQuest",
}: {
  className?: string;
  href?: string;
  size?: number;
  label?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      {/* Pixel sprite: skip the optimizer so it is never resampled smoothly. */}
      <Image
        src="/brand/logo.png"
        alt=""
        width={size}
        height={size}
        priority
        unoptimized
        aria-hidden
        className="[image-rendering:pixelated]"
      />
      <span className="font-heading text-3xl leading-none text-[var(--dq-gold)]">{label}</span>
    </Link>
  );
}
