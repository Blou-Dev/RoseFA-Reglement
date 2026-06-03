import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory } from "@/lib/admin-actions";
import { requireAdminSession } from "@/lib/auth-guard";
import { getAdminCategory } from "@/lib/docs";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const category = await getAdminCategory(id);

  if (!category) notFound();

  return (
    <AdminShell title={`Modifier ${category.title}`} description="Ajuste le titre, le slug, la description et l'ordre de la categorie.">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <CategoryForm
          action={updateCategory.bind(null, category.id)}
          initialValues={{
            title: category.title,
            slug: category.slug,
            description: category.description ?? "",
            order: category.order,
          }}
        />
      </div>
    </AdminShell>
  );
}
