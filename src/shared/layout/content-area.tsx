import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function ContentArea({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-lg", className)} {...props} />;
}
