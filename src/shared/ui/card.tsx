import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type CardVariant = "default" | "interactive" | "elevated";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default: "border-border/90 bg-surface shadow-soft",
  interactive: "border-border/90 bg-surface shadow-soft transition-all duration-ui hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface",
  elevated: "border-border/80 bg-surface shadow-surface"
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-card border text-surface-foreground", variantClasses[variant], className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-xs p-md pb-sm", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-card-title font-semibold text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-body leading-6 text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-md pt-0", className)} {...props} />;
}
