import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/lib/admin-actions";
import { requireAdminSession } from "@/lib/auth-guard";

export default async function NewCategoryPage() {
  await requireAdminSession();

  return (
    <AdminShell title="Nouvelle categorie" description="Cree une nouvelle categorie pour structurer la sidebar publique RoseFA.">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <CategoryForm action={createCategory} />
      </div>
    </AdminShell>
  );
}
