import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/login-form";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-shared";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  if (session && isAdminRole(session.user?.role)) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#100c11_0%,#08080b_100%)] px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="border-b border-white/10 pb-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Admin prive</div>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-white">Connexion admin RoseFA</h1>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Acces reserve a l'administration du site et a la gestion des contenus publics.
          </p>
        </div>
        <p className="mt-5 text-sm leading-7 text-white/60">
          Acces prive reserve aux comptes autorises. Le compte principal defini dans <code>ADMIN_EMAIL</code> conserve la gestion des comptes writer.
        </p>
        <div className="mt-6 rounded-lg border border-white/10 bg-black/18 p-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
