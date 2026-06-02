import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-control w-full rounded-input border border-border bg-surface px-3 py-2 text-body text-foreground shadow-soft transition-colors duration-ui focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-[invalid=true]:border-danger",
        className
      )}
      {...props}
    />
  );
}
