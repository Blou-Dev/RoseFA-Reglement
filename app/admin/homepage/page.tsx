import { AdminShell } from "@/components/admin/admin-shell";
import { HomePageForm } from "@/components/admin/homepage-form";
import { updateHomePage } from "@/lib/admin-actions";
import { requireAdminSession } from "@/lib/auth-guard";
import { getAdminHomePageContent } from "@/lib/docs";

export default async function AdminHomePage() {
  await requireAdminSession();
  const homepage = await getAdminHomePageContent();

  return (
    <AdminShell
      title="Homepage"
      description="Modifie le contenu public de la page d'accueil RoseFA sans toucher au code."
    >
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <HomePageForm action={updateHomePage} initialValues={homepage} />
      </div>
    </AdminShell>
  );
}
