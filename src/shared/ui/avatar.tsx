import type { ImgHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  name: string;
  size?: AvatarSize;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl"
};

export function Avatar({ src, name, size = "md", className, alt, ...props }: AvatarProps) {
  const label = alt ?? name;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label}
        className={cn(
          "shrink-0 rounded-avatar border border-border bg-muted object-cover shadow-soft",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-avatar border border-border bg-muted font-semibold text-muted-foreground shadow-soft",
        sizeClasses[size],
        className
      )}
      aria-label={label}
      role="img"
    >
      {getInitials(name)}
    </span>
  );
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "JD";
}
