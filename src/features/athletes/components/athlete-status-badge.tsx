import { mk } from "@/shared/i18n/mk";
import { Badge } from "@/shared/ui/badge";
import type { AthleteStatus } from "../domain/athlete";

const statusLabels: Record<AthleteStatus, string> = {
  active: mk.common.active,
  paused: mk.common.paused,
  inactive: mk.common.inactive
};

const statusTones: Record<AthleteStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  paused: "warning",
  inactive: "neutral"
};

type AthleteStatusBadgeProps = {
  status: AthleteStatus;
};

export function AthleteStatusBadge({ status }: AthleteStatusBadgeProps) {
  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}
