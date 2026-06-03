import { AdminShell } from "@/components/admin/admin-shell";
import { PageForm } from "@/components/admin/page-form";
import { createPage } from "@/lib/admin-actions";
import { requireAdminSession } from "@/lib/auth-guard";
import { getAdminCategories } from "@/lib/docs";

export default async function NewPagePage() {
  await requireAdminSession();
  const categories = await getAdminCategories();
  const categoryOptions = categories.map((category: { id: string; title: string }) => ({
    id: category.id,
    title: category.title,
  }));

  return (
    <AdminShell title="Nouvelle page" description="Cree une page RoseFA avec contenu Markdown ou MDX, statut et ordre.">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <PageForm action={createPage} categories={categoryOptions} />
      </div>
    </AdminShell>
  );
}
