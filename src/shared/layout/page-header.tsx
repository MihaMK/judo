import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, eyebrow, action, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-sm border-b border-border/70 pb-lg sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-caption font-semibold uppercase text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="mt-1 text-page-title font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-body leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-sm">{action}</div> : null}
    </header>
  );
}
