import Link from "next/link";
import { ArrowDown, ArrowUp, FilePenLine, FolderOpen, Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { OWNER_ROLE } from "@/lib/auth-shared";
import { requireAdminSession } from "@/lib/auth-guard";
import { deleteCategory, deletePage, moveCategory, movePage } from "@/lib/admin-actions";
import { getAdminCategories } from "@/lib/docs";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const categories = await getAdminCategories();
  const isOwner = session.user?.role === OWNER_ROLE;

  return (
    <AdminShell
      title="Dashboard RoseFA"
      description="Gere les categories, les pages, leur ordre de navigation, leur statut de publication et le contenu affiche sur le site public."
    >
      <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="space-y-4">
          {isOwner ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="text-sm font-medium text-white">Comptes writer</div>
              <p className="mt-2 text-sm leading-7 text-white/56">
                Cree et gere les comptes secondaires qui peuvent acceder au panel pour rediger ou mettre a jour la documentation.
              </p>
              <Link
                href="/admin/accounts"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-white/76 transition hover:bg-white/[0.04] hover:text-white"
              >
                <FilePenLine className="h-4 w-4" />
                Gerer les comptes writer
              </Link>
            </div>
          ) : null}

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="text-sm font-medium text-white">Homepage</div>
            <p className="mt-2 text-sm leading-7 text-white/56">
              Modifie l'accueil public RoseFA, sa banniere, ses textes d'introduction et ses liens principaux.
            </p>
            <Link
              href="/admin/homepage"
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-white/76 transition hover:bg-white/[0.04] hover:text-white"
            >
              <FilePenLine className="h-4 w-4" />
              Modifier la homepage
            </Link>
          </div>

          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-semibold text-white">Categories</h2>
            <p className="mt-1 text-sm leading-7 text-white/56">
              La sidebar publique suit cet ordre. Chaque categorie regroupe les pages visibles sur le site.
            </p>
          </div>

          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-white/76 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter une categorie
          </Link>

          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-white">
                      <FolderOpen className="h-4 w-4 text-rose-200/80" />
                      <span className="font-medium">{category.title}</span>
                    </div>
                    <div className="mt-1 text-sm text-white/42">/{category.slug}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <InlineMoveForm action={moveCategory} id={category.id} direction="up" />
                    <InlineMoveForm action={moveCategory} id={category.id} direction="down" />
                    <Link href={`/admin/categories/${category.id}`} className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/72 transition hover:bg-white/[0.04] hover:text-white">
                      Modifier
                    </Link>
                    <InlineDeleteForm action={deleteCategory} id={category.id} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/56">
                  {category.description || "Aucune description pour le moment."}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="border-b border-white/10 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Pages</h2>
                <p className="mt-1 text-sm leading-7 text-white/56">
                  Les pages publiques sont classees ici par categorie. Utilise les controles pour les deplacer, les modifier ou les supprimer.
                </p>
              </div>
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center gap-2 rounded-md border border-rose-400/30 bg-rose-500/12 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/18"
              >
                <Plus className="h-4 w-4" />
                Ajouter une page
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">{category.title}</div>
                <div className="overflow-hidden rounded-lg border border-white/10">
                  {category.pages.map((page, index) => (
                    <div
                      key={page.id}
                      className={`grid gap-3 bg-white/[0.02] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start ${
                        index !== category.pages.length - 1 ? "border-b border-white/10" : ""
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-white">
                          <FilePenLine className="h-4 w-4 text-rose-200/80" />
                          <span className="font-medium">{page.title}</span>
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                              page.status === "PUBLISHED"
                                ? "bg-emerald-400/12 text-emerald-200"
                                : "bg-white/8 text-white/48"
                            }`}
                          >
                            {page.status === "PUBLISHED" ? "Publie" : "Brouillon"}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-white/42">/docs/{category.slug}/{page.slug}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <InlineMoveForm action={movePage} id={page.id} direction="up" />
                        <InlineMoveForm action={movePage} id={page.id} direction="down" />
                        <Link href={`/docs/${category.slug}/${page.slug}`} className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/72 transition hover:bg-white/[0.04] hover:text-white">
                          Voir
                        </Link>
                        <Link href={`/admin/pages/${page.id}`} className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/72 transition hover:bg-white/[0.04] hover:text-white">
                          Modifier
                        </Link>
                        <InlineDeleteForm action={deletePage} id={page.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function InlineMoveForm({
  action,
  id,
  direction,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  direction: "up" | "down";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" className="rounded-md border border-white/10 p-2 text-white/68 transition hover:bg-white/[0.04] hover:text-white">
        {direction === "up" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
      </button>
    </form>
  );
}

function InlineDeleteForm({
  action,
  id,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded-md border border-red-400/20 bg-red-400/8 p-2 text-red-100 transition hover:bg-red-400/16">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
