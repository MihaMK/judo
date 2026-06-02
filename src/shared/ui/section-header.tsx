import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        <h2 className="text-section-title font-semibold tracking-normal text-foreground">{title}</h2>
        {description ? <p className="mt-xs max-w-2xl text-body leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-sm">{action}</div> : null}
    </div>
  );
}
