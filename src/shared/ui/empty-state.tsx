import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <section className="rounded-card border border-dashed border-border bg-surface/95 p-lg text-center shadow-soft">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card border border-border bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="mt-md text-card-title font-semibold text-surface-foreground">{title}</h2>
      <p className="mx-auto mt-xs max-w-2xl text-body leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-lg flex justify-center">{action}</div> : null}
    </section>
  );
}
