import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * Pixel buttons: ink outline with notched corners and a hard "ledge" underneath.
 * Pressing drops the button onto its ledge, which is the main tactile feedback in the app.
 */
const pixelEdge =
  "shadow-[0_-3px_0_var(--dq-ink),0_3px_0_var(--dq-ink),-3px_0_0_var(--dq-ink),3px_0_0_var(--dq-ink),inset_0_-4px_0_var(--btn-ledge),inset_0_3px_0_rgb(255_255_255/0.22)]";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-none border-0 pb-[4px] text-sm font-semibold whitespace-nowrap outline-none select-none transition-[transform,filter] duration-75 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--dq-gold)] active:not-aria-[haspopup]:translate-y-[2px] active:not-aria-[haspopup]:pb-0 active:not-aria-[haspopup]:pt-[2px] disabled:pointer-events-none disabled:opacity-50 disabled:saturate-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: `${pixelEdge} bg-[var(--dq-gold)] text-[#2a1a08] [--btn-ledge:var(--dq-gold-deep)] hover:brightness-110`,
        outline: `${pixelEdge} bg-[var(--dq-surface-container-high)] text-[var(--dq-parchment)] [--btn-ledge:#1e1a29] hover:bg-[var(--dq-surface-container-highest)] aria-expanded:bg-[var(--dq-surface-container-highest)]`,
        secondary: `${pixelEdge} bg-[var(--dq-mana)] text-[#150f2e] [--btn-ledge:#5547b0] hover:brightness-110`,
        ghost:
          "pb-0 text-[var(--muted-foreground)] hover:bg-[var(--dq-surface-container-high)] hover:text-[var(--dq-parchment)] active:not-aria-[haspopup]:pt-0 active:not-aria-[haspopup]:translate-y-0 aria-expanded:bg-[var(--dq-surface-container-high)]",
        destructive: `${pixelEdge} bg-[var(--dq-blood)] text-[#2b0a07] [--btn-ledge:#8e2620] hover:brightness-110`,
        link: "pb-0 text-[var(--dq-gold)] underline decoration-2 underline-offset-4 hover:text-[var(--dq-parchment)] active:not-aria-[haspopup]:pt-0",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
