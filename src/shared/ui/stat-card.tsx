import type { LucideIcon } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/cn";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  className?: string;
};

export function StatCard({ icon: Icon, label, value, description, className }: StatCardProps) {
  return (
    <Card variant="interactive" className={cn("p-md", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-caption font-medium text-muted-foreground">{label}</p>
          <p className="mt-xs truncate text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border border-border bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {description ? <p className="mt-md text-body leading-6 text-muted-foreground">{description}</p> : null}
    </Card>
  );
}
