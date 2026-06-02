import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("mx-auto w-full max-w-6xl px-md py-lg sm:px-lg md:py-xl lg:px-xl", className)} {...props} />;
}
