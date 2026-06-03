"use client";

import type { ReactNode } from "react";
import { useState } from "react";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryForm({
  action,
  initialValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initialValues?: {
    title?: string;
    slug?: string;
    description?: string;
    order?: number;
  };
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [manualSlug, setManualSlug] = useState(Boolean(initialValues?.slug));

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titre">
          <input
            name="title"
            value={title}
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              if (!manualSlug) setSlug(toSlug(value));
            }}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            required
          />
        </Field>

        <Field label="Slug">
          <input
            name="slug"
            value={slug}
            onChange={(event) => {
              setManualSlug(true);
              setSlug(toSlug(event.target.value));
            }}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            required
          />
        </Field>
      </div>

      <Field label="Description courte">
        <textarea
          name="description"
          defaultValue={initialValues?.description ?? ""}
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
        />
      </Field>

      <Field label="Ordre">
        <input
          type="number"
          name="order"
          defaultValue={initialValues?.order ?? 0}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
        />
      </Field>

      <button type="submit" className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400">
        Enregistrer la categorie
      </button>
    </form>
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
