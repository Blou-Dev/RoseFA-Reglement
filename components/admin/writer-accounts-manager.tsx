"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import type { AdminActionResult } from "@/lib/admin-actions";
import type { AdminWriterAccount } from "@/lib/types";

type WriterAction = (formData: FormData) => Promise<AdminActionResult>;

export function WriterAccountsManager({
  ownerEmail,
  writers,
  createAction,
  updateAction,
  deleteAction,
}: {
  ownerEmail: string;
  writers: AdminWriterAccount[];
  createAction: WriterAction;
  updateAction: WriterAction;
  deleteAction: WriterAction;
}) {
  const [createState, createFormAction, createPending] = useActionState<AdminActionResult, FormData>(
    async (_state, formData) => {
      return createAction(formData);
    },
    {
      status: "success",
      message: "",
    },
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm font-medium text-white">Compte principal</div>
          <p className="mt-2 text-sm leading-7 text-white/56">
            Le compte owner reste celui defini dans <code>ADMIN_EMAIL</code>. Il garde l&apos;acces exclusif a cette page de gestion.
          </p>
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/78">
            {ownerEmail}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm font-medium text-white">Nouveau writer</div>
          <p className="mt-2 text-sm leading-7 text-white/56">
            Cree un compte secondaire pour rediger la documentation, sans donner l&apos;acces a la gestion des comptes.
          </p>

          <form action={createFormAction} className="mt-4 space-y-3">
            <Field label="Nom">
              <input
                name="name"
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                placeholder="Nom du writer"
                required
              />
            </Field>

            <Field label="Email">
              <input
                name="email"
                type="email"
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                placeholder="writer@rosefa.fr"
                required
              />
            </Field>

            <Field label="Mot de passe">
              <input
                name="password"
                type="password"
                minLength={8}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                placeholder="8 caracteres minimum"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={createPending}
              className="w-full rounded-md border border-rose-400/30 bg-rose-500/12 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createPending ? "Creation..." : "Creer le compte writer"}
            </button>
          </form>

          {createState.message ? (
            <div className={`mt-3 text-sm ${createState.status === "success" ? "text-emerald-200" : "text-red-200"}`}>
              {createState.message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">Comptes writer</h2>
          <p className="mt-1 text-sm leading-7 text-white/56">
            Les writers peuvent se connecter au panel et modifier la documentation, mais cette page reste reservee au compte owner.
          </p>
        </div>

        {writers.length ? (
          <div className="space-y-4">
            {writers.map((writer) => (
              <WriterAccountCard
                key={writer.id}
                writer={writer}
                updateAction={updateAction}
                deleteAction={deleteAction}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 text-sm text-white/56">
            Aucun compte writer pour le moment.
          </div>
        )}
      </section>
    </div>
  );
}

function WriterAccountCard({
  writer,
  updateAction,
  deleteAction,
}: {
  writer: AdminWriterAccount;
  updateAction: WriterAction;
  deleteAction: WriterAction;
}) {
  const [updateState, updateFormAction, updatePending] = useActionState<AdminActionResult, FormData>(
    async (_state, formData) => {
      return updateAction(formData);
    },
    {
      status: "success",
      message: "",
    },
  );

  const [deleteState, deleteFormAction, deletePending] = useActionState<AdminActionResult, FormData>(
    async (_state, formData) => {
      return deleteAction(formData);
    },
    {
      status: "success",
      message: "",
    },
  );

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <form action={updateFormAction} className="grid gap-4">
        <input type="hidden" name="id" value={writer.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom">
            <input
              name="name"
              defaultValue={writer.name}
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
              required
            />
          </Field>

          <Field label="Email">
            <input
              name="email"
              type="email"
              defaultValue={writer.email}
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Field label="Nouveau mot de passe">
            <input
              name="password"
              type="password"
              minLength={8}
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
              placeholder="Laisser vide pour ne pas changer"
            />
          </Field>

          <label className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm text-white/76">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={writer.isActive}
              className="h-4 w-4 rounded border-white/10 bg-transparent"
            />
            Compte actif
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-white/42">
            Cree le {new Intl.DateTimeFormat("fr-FR").format(new Date(writer.createdAt))}
          </div>

          <button
            type="submit"
            disabled={updatePending}
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updatePending ? "Mise a jour..." : "Mettre a jour"}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="text-xs text-white/42">
          Derniere mise a jour le {new Intl.DateTimeFormat("fr-FR").format(new Date(writer.updatedAt))}
        </div>

        <form action={deleteFormAction}>
          <input type="hidden" name="id" value={writer.id} />
          <button
            type="submit"
            disabled={deletePending}
            className="inline-flex items-center gap-2 rounded-md border border-red-400/20 bg-red-400/8 px-3 py-2 text-sm text-red-100 transition hover:bg-red-400/16 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {deletePending ? "Suppression..." : "Supprimer"}
          </button>
        </form>
      </div>

      {updateState.message ? (
        <div className={`mt-3 text-sm ${updateState.status === "success" ? "text-emerald-200" : "text-red-200"}`}>
          {updateState.message}
        </div>
      ) : null}

      {deleteState.message ? (
        <div className={`mt-3 text-sm ${deleteState.status === "success" ? "text-emerald-200" : "text-red-200"}`}>
          {deleteState.message}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/68">{label}</span>
      {children}
    </label>
  );
}
