import Link from "next/link";
import { Avatar } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/cn";

type ClubBrandProps = {
  clubName?: string;
  logoUrl?: string | null;
  subtitle?: string;
  compact?: boolean;
  className?: string;
};

export function ClubBrand({
  clubName = "Judo Drim",
  logoUrl,
  subtitle = "Мобилен оперативен систем за џудо клуб",
  compact = false,
  className
}: ClubBrandProps) {
  return (
    <Link
      href="/today"
      className={cn(
        "group flex min-w-0 items-center rounded-card transition-colors duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        compact ? "justify-center p-xs" : "gap-sm p-sm hover:bg-white/[0.04]",
        className
      )}
      aria-label={clubName}
    >
      <span className="relative">
        <span className="absolute inset-0 rounded-avatar bg-gold/30 blur-md transition-opacity duration-ui group-hover:opacity-80" aria-hidden="true" />
        <Avatar
          src={logoUrl}
          name={clubName}
          size={compact ? "md" : "lg"}
          className="relative border-white/15 bg-gold text-gold-foreground shadow-soft"
        />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block truncate text-card-title font-semibold text-white">{clubName}</span>
          <span className="mt-0.5 block truncate text-caption text-slate-400">{subtitle}</span>
        </span>
      ) : null}
    </Link>
  );
}
