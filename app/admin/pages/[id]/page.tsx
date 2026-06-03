import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageForm } from "@/components/admin/page-form";
import { updatePage } from "@/lib/admin-actions";
import { requireAdminSession } from "@/lib/auth-guard";
import { getAdminCategories, getAdminPage } from "@/lib/docs";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const [page, categories] = await Promise.all([getAdminPage(id), getAdminCategories()]);
  const categoryOptions = categories.map((category: { id: string; title: string }) => ({
    id: category.id,
    title: category.title,
  }));

  if (!page) notFound();

  return (
    <AdminShell title={`Modifier ${page.title}`} description="Mets a jour le contenu, le statut, le slug et la categorie de cette page.">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <PageForm
          action={updatePage.bind(null, page.id)}
          pageId={page.id}
          categories={categoryOptions}
          initialValues={{
            categoryId: page.categoryId,
            title: page.title,
            slug: page.slug,
            description: page.description,
            excerpt: page.excerpt ?? "",
            banner: page.banner ?? "",
            body: page.body,
            order: page.order,
            status: page.status,
          }}
        />
      </div>
    </AdminShell>
  );
}
