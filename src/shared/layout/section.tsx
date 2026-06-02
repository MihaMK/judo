import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type SectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function Section({ title, description, action, className, children, ...props }: SectionProps) {
  return (
    <section className={cn("space-y-md", className)} {...props}>
      {title || description || action ? (
        <div className="flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-section-title font-semibold text-foreground">{title}</h2> : null}
            {description ? <p className="mt-1 max-w-2xl text-body leading-6 text-muted-foreground">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-sm">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
