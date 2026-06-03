"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { HomePageSectionType } from "@prisma/client";
import { ImagePlus, LoaderCircle, Plus, Trash2 } from "lucide-react";
import type { AdminActionResult } from "@/lib/admin-actions";
import type { HomePageContentData, HomePageLinkItem } from "@/lib/types";

const iconOptions = [
  { value: "book-open", label: "Livre" },
  { value: "shield", label: "Bouclier" },
  { value: "wifi", label: "Connexion" },
  { value: "gavel", label: "Marteau" },
  { value: "landmark", label: "Institution" },
  { value: "sword", label: "Illegal" },
  { value: "store", label: "Boutique" },
];

export function HomePageForm({
  action,
  initialValues,
}: {
  action: (formData: FormData) => void | Promise<void | AdminActionResult>;
  initialValues: HomePageContentData;
}) {
  const [banner, setBanner] = useState(initialValues.banner);
  const [startLinks, setStartLinks] = useState(initialValues.startLinks);
  const [regulationLinks, setRegulationLinks] = useState(initialValues.regulationLinks);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AdminActionResult | null>(null);

  const linksJson = useMemo(
    () =>
      JSON.stringify(
        [...startLinks, ...regulationLinks].map((link, index) => ({
          section: link.section,
          title: link.title,
          description: link.description,
          href: link.href,
          icon: link.icon,
          order: (index + 1) * 10,
        })),
      ),
    [regulationLinks, startLinks],
  );

  const [formState, formAction, isSaving] = useActionState<AdminActionResult | null, FormData>(
    async (_previousState, formData) => {
      try {
        const result = await action(formData);
        return (
          result ?? {
            status: "success",
            message: "Page d'accueil enregistree.",
          }
        );
      } catch {
        return {
          status: "error",
          message: "La sauvegarde de la page d'accueil a echoue.",
        };
      }
    },
    null,
  );

  useEffect(() => {
    if (formState) {
      setFeedback(formState);
    }
  }, [formState]);

  async function handleBannerUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    setUploading(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setUploadError(payload.error ?? "Upload impossible.");
        return;
      }

      setBanner(payload.url);
    } catch {
      setUploadError("Upload impossible.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function updateLink(
    section: HomePageSectionType,
    index: number,
    key: keyof Pick<HomePageLinkItem, "title" | "description" | "href" | "icon">,
    value: string,
  ) {
    const updater = (items: HomePageLinkItem[]) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item));

    if (section === HomePageSectionType.START) {
      setStartLinks((current) => updater(current));
      return;
    }

    setRegulationLinks((current) => updater(current));
  }

  function addLink(section: HomePageSectionType) {
    const nextLink: HomePageLinkItem = {
      id: `${section.toLowerCase()}-${Date.now()}`,
      section,
      title: "",
      description: "",
      href: "/docs/",
      icon: section === HomePageSectionType.START ? "book-open" : "gavel",
      order: 0,
    };

    if (section === HomePageSectionType.START) {
      setStartLinks((current) => [...current, nextLink]);
      return;
    }

    setRegulationLinks((current) => [...current, nextLink]);
  }

  function removeLink(section: HomePageSectionType, index: number) {
    if (section === HomePageSectionType.START) {
      setStartLinks((current) => current.filter((_, itemIndex) => itemIndex !== index));
      return;
    }

    setRegulationLinks((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <form action={formAction} className="grid gap-6" onSubmit={() => setFeedback(null)}>
      <input type="hidden" name="linksJson" value={linksJson} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titre principal">
          <input
            name="heroTitle"
            defaultValue={initialValues.heroTitle}
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            required
          />
        </Field>

        <Field label="Sous-titre">
          <input
            name="heroSubtitle"
            defaultValue={initialValues.heroSubtitle}
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            required
          />
        </Field>
      </div>

      <Field label="Titre de bienvenue">
        <input
          name="introTitle"
          defaultValue={initialValues.introTitle}
          className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
          required
        />
      </Field>

      <div className="grid gap-4">
        <Field label="Texte d'introduction">
          <textarea
            name="introBody"
            defaultValue={initialValues.introBody}
            rows={3}
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            required
          />
        </Field>

        <Field label="Texte d'introduction secondaire">
          <textarea
            name="introBodySecondary"
            defaultValue={initialValues.introBodySecondary}
            rows={4}
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            required
          />
        </Field>
      </div>

      <Field label="Message d'avertissement">
        <textarea
          name="warningText"
          defaultValue={initialValues.warningText}
          rows={3}
          className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
          required
        />
      </Field>

      <Field label="Banniere de la homepage">
        <div className="space-y-3">
          <input
            name="banner"
            value={banner}
            onChange={(event) => setBanner(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            placeholder="/images/rosefa-banner-main.png"
            required
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.05]">
            {uploading ? <LoaderCircle className="h-4 w-4 animate-spin text-rose-300" /> : <ImagePlus className="h-4 w-4 text-rose-300" />}
            <span>{uploading ? "Upload en cours..." : "Uploader une image de banniere"}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={handleBannerUpload} />
          </label>
          {uploadError ? <div className="text-sm text-red-200">{uploadError}</div> : null}
          {banner ? (
            <div className="overflow-hidden rounded-md border border-white/10 bg-black/25">
              <img src={banner} alt="Preview banniere homepage" className="h-40 w-full object-cover" />
            </div>
          ) : null}
        </div>
      </Field>

      <LinkSection
        title="Commencer ici"
        section={HomePageSectionType.START}
        items={startLinks}
        onAdd={addLink}
        onRemove={removeLink}
        onUpdate={updateLink}
      />

      <LinkSection
        title="Reglements principaux"
        section={HomePageSectionType.REGULATION}
        items={regulationLinks}
        onAdd={addLink}
        onRemove={removeLink}
        onUpdate={updateLink}
      />

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md border border-rose-400/30 bg-rose-500/14 px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/22 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Enregistrement..." : "Enregistrer la homepage"}
      </button>

      {feedback ? (
        <div className={`text-sm ${feedback.status === "success" ? "text-emerald-200" : "text-red-200"}`}>
          {feedback.message}
        </div>
      ) : null}
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/68">{label}</span>
      {children}
    </label>
  );
}

function LinkSection({
  title,
  section,
  items,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string;
  section: HomePageSectionType;
  items: HomePageLinkItem[];
  onAdd: (section: HomePageSectionType) => void;
  onRemove: (section: HomePageSectionType, index: number) => void;
  onUpdate: (
    section: HomePageSectionType,
    index: number,
    key: keyof Pick<HomePageLinkItem, "title" | "description" | "href" | "icon">,
    value: string,
  ) => void;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/55">Chaque ligne correspond a une carte/lien affiche sur la homepage.</p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(section)}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-white/76 transition hover:bg-white/[0.04] hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-md border border-white/10 bg-black/15 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Titre">
                <input
                  value={item.title}
                  onChange={(event) => onUpdate(section, index, "title", event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  required
                />
              </Field>

              <Field label="Lien">
                <input
                  value={item.href}
                  onChange={(event) => onUpdate(section, index, "href", event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  required
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_200px_auto] md:items-end">
              <Field label="Description">
                <textarea
                  value={item.description}
                  onChange={(event) => onUpdate(section, index, "description", event.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  required
                />
              </Field>

              <Field label="Icone">
                <select
                  value={item.icon}
                  onChange={(event) => onUpdate(section, index, "icon", event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-[#15151c] px-4 py-3 text-white outline-none"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <button
                type="button"
                onClick={() => onRemove(section, index)}
                className="inline-flex items-center justify-center rounded-md border border-red-400/20 bg-red-400/8 px-3 py-3 text-red-100 transition hover:bg-red-400/16"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
