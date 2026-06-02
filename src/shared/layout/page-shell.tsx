import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/layout/page-header";

type PageShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} className="mb-lg" />
      {children}
    </PageContainer>
  );
}
