import { Settings } from "lucide-react";
import { ShellPlaceholderPage } from "@/shared/layout/shell-placeholder-page";

export default function SettingsPage() {
  return (
    <ShellPlaceholderPage
      title="Подесувања"
      description="Клуб, тренери, групи и членарина ќе се имплементираат во контролирана Settings фаза."
      phase="Phase 9"
      icon={Settings}
    />
  );
}
