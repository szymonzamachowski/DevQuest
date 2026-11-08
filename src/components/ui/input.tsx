import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-none border-0 bg-[var(--dq-surface-container-lowest)] px-3 py-1 text-base text-[var(--dq-parchment)] shadow-[0_-3px_0_var(--dq-ink),0_3px_0_var(--dq-ink),-3px_0_0_var(--dq-ink),3px_0_0_var(--dq-ink),inset_3px_3px_0_rgb(0_0_0/0.45)] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--dq-outline)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--dq-gold)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:shadow-[0_-3px_0_var(--dq-blood),0_3px_0_var(--dq-blood),-3px_0_0_var(--dq-blood),3px_0_0_var(--dq-blood)] md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
