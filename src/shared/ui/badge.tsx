import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  variant?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-success/60 bg-success text-success-foreground",
  warning: "border-warning/60 bg-warning text-warning-foreground",
  danger: "border-danger/60 bg-danger text-danger-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary"
};

export function Badge({ className, tone, variant, ...props }: BadgeProps) {
  const resolvedTone = variant ?? tone ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-badge font-medium leading-none",
        toneClasses[resolvedTone],
        className
      )}
      {...props}
    />
  );
}
