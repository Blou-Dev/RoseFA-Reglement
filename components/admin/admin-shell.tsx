import type { ReactNode } from "react";
import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/logout-button";
import { OWNER_ROLE } from "@/lib/auth-shared";
import { getAdminSession } from "@/lib/auth-guard";
import { getActiveEditingSessions } from "@/lib/editing-sessions";

export async function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const session = await getAdminSession();
  const activeEditingSessions = await getActiveEditingSessions();
  const currentEditingSession = activeEditingSessions[0];
  const isOwner = session?.user?.role === OWNER_ROLE;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#100c11_0%,#08080b_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="border-b border-white/10 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Admin prive</div>
              <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">{description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/admin" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/72 transition hover:bg-white/[0.04] hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/categories/new" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/72 transition hover:bg-white/[0.04] hover:text-white">
                Nouvelle categorie
              </Link>
              <Link href="/admin/pages/new" className="rounded-md border border-rose-400/30 bg-rose-500/12 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/18">
                Nouvelle page
              </Link>
              {isOwner ? (
                <Link href="/admin/accounts" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/72 transition hover:bg-white/[0.04] hover:text-white">
                  Comptes writer
                </Link>
              ) : null}
              <AdminLogoutButton />
            </div>
          </div>
        </div>

        {currentEditingSession ? (
          <div className="mt-4 rounded-md border border-amber-300/18 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100/90">
            <div className="font-medium">
              Reglement en cours d'edition : {currentEditingSession.category.title}
            </div>
            <div className="mt-1 text-amber-100/70">
              {currentEditingSession.pageTitle ? `Page ouverte : ${currentEditingSession.pageTitle}. ` : ""}
              Editeur actif : {currentEditingSession.editorName || currentEditingSession.editorEmail}
            </div>
          </div>
        ) : null}

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
