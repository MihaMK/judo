import { redirect } from "next/navigation";
import { CategoryManagementPanel } from "@/features/categories/components/category-management-panel";
import { getCategoryManagementView } from "@/features/categories/server/category-read-models";
import { getSessionContext } from "@/features/auth/server/session";
import { PageShell } from "@/shared/layout/page-shell";

export default async function ManagementCategoriesPage() {
  const sessionContext = await getSessionContext();

  if (sessionContext.role !== "management") {
    redirect("/management");
  }

  const groups = await getCategoryManagementView(sessionContext.clubId);

  return (
    <PageShell
      title="Категории и тежини"
      description="Оперативна администрација на возрасни категории, тежински категории и основа за автоматска категоризација."
    >
      <CategoryManagementPanel groups={groups} />
    </PageShell>
  );
}
