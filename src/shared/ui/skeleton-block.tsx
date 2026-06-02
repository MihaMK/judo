import { cn } from "@/shared/lib/cn";

type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div className={cn("animate-pulse rounded-card bg-muted", className)} aria-hidden="true" />;
}
