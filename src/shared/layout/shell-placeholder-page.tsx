import type { LucideIcon } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";

type ShellPlaceholderPageProps = {
  title: string;
  description: string;
  phase: string;
  icon: LucideIcon;
};

export function ShellPlaceholderPage({ title, description, phase, icon: Icon }: ShellPlaceholderPageProps) {
  return (
    <PageContainer>
      <div className="relative overflow-hidden rounded-panel border border-border bg-surface p-lg shadow-surface md:p-xl">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold/12 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 left-8 h-52 w-52 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

        <div className="relative grid gap-xl lg:grid-cols-[1fr_320px] lg:items-end">
          <div className="max-w-2xl">
            <Badge className="border-gold/30 bg-gold/12 text-gold">{phase}</Badge>
            <div className="mt-lg flex items-start gap-md">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-slate-950 text-gold shadow-soft">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
                <p className="mt-sm text-body leading-7 text-muted-foreground">{description}</p>
              </div>
            </div>
          </div>

          <Card className="relative p-md">
            <p className="text-card-title font-semibold text-foreground">Подготвена површина</p>
            <p className="mt-xs text-body leading-6 text-muted-foreground">
              Shell-от е активен. Содржината за овој модул ќе се имплементира во планираната фаза без да се меша со тековната навигациска основа.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
