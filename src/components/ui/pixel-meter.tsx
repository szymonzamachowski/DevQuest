import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MeterTone = "gold" | "ember" | "moss" | "blood" | "mana";

const toneVar: Record<MeterTone, string> = {
  gold: "var(--dq-gold)",
  ember: "var(--dq-ember)",
  moss: "var(--dq-moss)",
  blood: "var(--dq-blood)",
  mana: "var(--dq-mana)",
};

export const toneText: Record<MeterTone, string> = {
  gold: "text-[var(--dq-gold)]",
  ember: "text-[var(--dq-ember)]",
  moss: "text-[var(--dq-moss)]",
  blood: "text-[var(--dq-blood)]",
  mana: "text-[var(--dq-mana)]",
};

/** Segmented pixel bar with a label row. `value` is clamped to 0-100. */
export function PixelMeter({
  label,
  value,
  display,
  tone = "gold",
  hint,
  className,
}: {
  label: ReactNode;
  value: number;
  display?: ReactNode;
  tone?: MeterTone;
  hint?: ReactNode;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[var(--muted-foreground)]">{label}</span>
        <span className={cn("text-xl", toneText[tone])}>{display ?? `${clamped}%`}</span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={typeof label === "string" ? label : undefined}
        className="dq-meter"
        style={{ "--meter-color": toneVar[tone] } as CSSProperties}
      >
        <span style={{ "--value": clamped } as CSSProperties} />
      </div>
      {hint ? <div className="text-sm text-[var(--dq-outline)]">{hint}</div> : null}
    </div>
  );
}

/** Health band key from project-health rules mapped to a meter tone. */
export function healthTone(bandKey: string): MeterTone {
  switch (bandKey) {
    case "EXCELLENT":
    case "STABLE":
      return "moss";
    case "AT_RISK":
      return "gold";
    case "CRITICAL":
      return "ember";
    default:
      return "blood";
  }
}

export const rarityText: Record<string, string> = {
  COMMON: "text-[var(--dq-parchment)]",
  RARE: "text-[var(--dq-mana)]",
  EPIC: "text-[var(--dq-ember)]",
  LEGENDARY: "text-[var(--dq-gold)]",
};
