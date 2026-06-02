import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, htmlFor, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-xs", className)}>
      <label htmlFor={htmlFor} className="block text-body font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? <p className="text-caption leading-5 text-danger-foreground">{error}</p> : null}
      {!error && hint ? <p className="text-caption leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
