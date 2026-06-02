import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/shared/lib/cn";

type InputVariant = "default" | "error";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
};

const variantClasses: Record<InputVariant, string> = {
  default: "border-border focus-visible:border-primary focus-visible:ring-ring/20",
  error: "border-danger focus-visible:border-danger focus-visible:ring-danger/30"
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, variant = "default", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-control w-full rounded-input border bg-surface px-3 py-2 text-body text-foreground shadow-soft transition-colors duration-ui placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
