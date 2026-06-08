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
        "group flex min-w-0 rounded-card transition-colors duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        compact
          ? "items-center justify-center p-xs"
          : "min-h-64 flex-col items-center justify-center gap-sm p-md text-center hover:bg-white/[0.04]",
        className
      )}
      aria-label={clubName}
    >
      <span className="relative">
        <span className="absolute inset-0 rounded-full bg-gold/30 blur-md transition-opacity duration-ui group-hover:opacity-80" aria-hidden="true" />
        {logoUrl ? (
          <span
            className={`relative block shrink-0 overflow-hidden rounded-full border border-white/15 bg-white shadow-soft ${compact ? "h-10 w-10 p-0.5" : "h-36 w-36 p-1.5"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={clubName}
              className="h-full w-full object-contain"
            />
          </span>
        ) : (
          <Avatar
            name={clubName}
            size={compact ? "md" : "lg"}
            className="relative border-white/15 bg-gold text-gold-foreground shadow-soft"
          />
        )}
      </span>
      {!compact ? (
        <span className="min-w-0 max-w-full">
          <span className="block max-w-full truncate text-card-title font-semibold text-white">{clubName}</span>
          <span className="mt-1 block max-w-full truncate text-caption text-slate-400">{subtitle}</span>
        </span>
      ) : null}
    </Link>
  );
}
