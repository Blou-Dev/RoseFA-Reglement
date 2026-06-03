"use client";

import type { ChangeEvent, ReactNode, RefObject } from "react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { PageStatus } from "@prisma/client";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  LoaderCircle,
  Minus,
  Pilcrow,
  Underline,
} from "lucide-react";
import type { AdminActionResult } from "@/lib/admin-actions";
import { renderSimpleEditorPreview } from "@/lib/simple-editor-preview";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type CategoryOption = {
  id: string;
  title: string;
};

type EditingSessionInfo = {
  categoryId: string;
  categoryTitle: string;
  pageId?: string | null;
  pageTitle?: string | null;
  editorEmail: string;
  editorName?: string | null;
  editorKey: string;
  hasUnsavedChanges: boolean;
  expiresAt: string;
  ownedByCurrentAdmin?: boolean;
};

type PageFormSnapshot = {
  categoryId: string;
  status: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  banner: string;
  body: string;
  order: string;
};

function getFormSnapshot(form: HTMLFormElement): PageFormSnapshot {
  const data = new FormData(form);

  return {
    categoryId: String(data.get("categoryId") ?? ""),
    status: String(data.get("status") ?? ""),
    title: String(data.get("title") ?? ""),
    slug: String(data.get("slug") ?? ""),
    description: String(data.get("description") ?? ""),
    excerpt: String(data.get("excerpt") ?? ""),
    banner: String(data.get("banner") ?? ""),
    body: String(data.get("body") ?? ""),
    order: String(data.get("order") ?? "0"),
  };
}

function buildInitialSnapshot({
  categories,
  initialValues,
}: {
  categories: CategoryOption[];
  initialValues?: {
    categoryId?: string;
    title?: string;
    slug?: string;
    description?: string;
    excerpt?: string;
    banner?: string;
    body?: string;
    order?: number;
    status?: PageStatus;
  };
}): PageFormSnapshot {
  return {
    categoryId: initialValues?.categoryId ?? categories[0]?.id ?? "",
    status: initialValues?.status ?? PageStatus.DRAFT,
    title: initialValues?.title ?? "",
    slug: initialValues?.slug ?? "",
    description: initialValues?.description ?? "",
    excerpt: initialValues?.excerpt ?? "",
    banner: initialValues?.banner ?? "",
    body: initialValues?.body ?? "",
    order: String(initialValues?.order ?? 0),
  };
}

function updateTextSelection(
  textarea: HTMLTextAreaElement,
  nextValue: string,
  selectionStart: number,
  selectionEnd: number,
  setBody: (value: string) => void,
) {
  setBody(nextValue);

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(selectionStart, selectionEnd);
  });
}

function wrapSelection(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  setBody: (value: string) => void,
  before: string,
  after: string,
  placeholder: string,
) {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.slice(start, end) || placeholder;
  const nextValue = `${textarea.value.slice(0, start)}${before}${selectedText}${after}${textarea.value.slice(end)}`;
  const nextSelectionStart = start + before.length;
  const nextSelectionEnd = nextSelectionStart + selectedText.length;

  updateTextSelection(textarea, nextValue, nextSelectionStart, nextSelectionEnd, setBody);
}

function prefixLines(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  setBody: (value: string) => void,
  prefix: string,
) {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const lineEndCandidate = value.indexOf("\n", end);
  const lineEnd = lineEndCandidate === -1 ? value.length : lineEndCandidate;
  const selectedBlock = value.slice(lineStart, lineEnd);
  const transformedBlock = selectedBlock
    .split("\n")
    .map((line) => (line.trim().length ? `${prefix}${line}` : line))
    .join("\n");
  const nextValue = `${value.slice(0, lineStart)}${transformedBlock}${value.slice(lineEnd)}`;

  updateTextSelection(
    textarea,
    nextValue,
    lineStart,
    lineStart + transformedBlock.length,
    setBody,
  );
}

function insertAtSelection(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  setBody: (value: string) => void,
  insertedText: string,
) {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const nextValue = `${textarea.value.slice(0, start)}${insertedText}${textarea.value.slice(end)}`;
  const nextCursor = start + insertedText.length;

  updateTextSelection(textarea, nextValue, nextCursor, nextCursor, setBody);
}

export function PageForm({
  action,
  categories,
  initialValues,
  pageId,
}: {
  action: (formData: FormData) => void | Promise<void | AdminActionResult>;
  categories: CategoryOption[];
  initialValues?: {
    categoryId?: string;
    title?: string;
    slug?: string;
    description?: string;
    excerpt?: string;
    banner?: string;
    body?: string;
    order?: number;
    status?: PageStatus;
  };
  pageId?: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorKeyRef = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `editor-${Date.now()}`,
  );
  const activeCategoryLockRef = useRef<string | null>(null);
  const initialSnapshotRef = useRef<PageFormSnapshot>(
    buildInitialSnapshot({
      categories,
      initialValues,
    }),
  );
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [manualSlug, setManualSlug] = useState(Boolean(initialValues?.slug));
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [banner, setBanner] = useState(initialValues?.banner ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? categories[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<EditingSessionInfo | null>(null);
  const [lockConflict, setLockConflict] = useState<EditingSessionInfo | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<AdminActionResult | null>(null);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockFeedback, setUnlockFeedback] = useState<string | null>(null);
  const [isForceUnlocking, setIsForceUnlocking] = useState(false);

  const categoryTitleById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.title])),
    [categories],
  );

  const currentCategoryTitle = categoryTitleById.get(categoryId) ?? "Categorie inconnue";
  const editorKey = editorKeyRef.current;
  const initialCategoryId = initialValues?.categoryId ?? categories[0]?.id ?? "";
  const isLockedByAnotherEditor = Boolean(lockConflict && lockConflict.editorKey !== editorKey);
  const previewHtml = useMemo(() => renderSimpleEditorPreview(body), [body]);
  const [formState, formAction, isSaving] = useActionState<AdminActionResult | null, FormData>(
    async (_previousState, formData) => {
      try {
        const result = await action(formData);

        return (
          result ?? {
            status: "success",
            message: "Modifications enregistrees.",
          }
        );
      } catch {
        return {
          status: "error",
          message: "La sauvegarde a echoue. Reessaie dans quelques instants.",
        };
      }
    },
    null,
  );

  useEffect(() => {
    if (!formState) return;

    setSaveFeedback(formState);

    if (formState.status === "success" && formRef.current) {
      initialSnapshotRef.current = getFormSnapshot(formRef.current);
      setIsDirty(false);
      setEditingSession(null);
      setLockConflict(null);
      activeCategoryLockRef.current = null;
    }
  }, [formState]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentLock() {
      if (!categoryId) return;

      try {
        const response = await fetch(`/api/admin/editing?categoryId=${encodeURIComponent(categoryId)}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as { session: EditingSessionInfo | null };
        if (cancelled) return;

        if (
          payload.session &&
          payload.session.editorKey !== editorKey &&
          !payload.session.ownedByCurrentAdmin
        ) {
          setLockConflict(payload.session);
          setStatusMessage(`Reglement deja en cours d'edition : ${payload.session.categoryTitle}`);
        } else if (!isDirty) {
          setLockConflict(null);
          setStatusMessage(null);
        }
      } catch {
        if (!cancelled) {
          setLockConflict(null);
        }
      }
    }

    void loadCurrentLock();

    return () => {
      cancelled = true;
    };
  }, [categoryId, editorKey, isDirty]);

  useEffect(() => {
    async function releaseCategory(categoryToRelease: string) {
      if (!categoryToRelease) return;

      await fetch("/api/admin/editing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "release",
          categoryId: categoryToRelease,
          editorKey,
        }),
      });
    }

    if (!isDirty) {
      const activeCategoryId = activeCategoryLockRef.current;
      if (activeCategoryId) {
        void releaseCategory(activeCategoryId);
        activeCategoryLockRef.current = null;
      }
      setEditingSession(null);
      return;
    }

    let cancelled = false;

    async function sendHeartbeat() {
      const previousCategoryId = activeCategoryLockRef.current;
      if (previousCategoryId && previousCategoryId !== categoryId) {
        await releaseCategory(previousCategoryId);
        activeCategoryLockRef.current = null;
      }

      const response = await fetch("/api/admin/editing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "heartbeat",
          categoryId,
          pageId,
          pageTitle: title || initialValues?.title || "Page sans titre",
          editorKey,
          hasUnsavedChanges: true,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        session?: EditingSessionInfo | null;
      };

      if (cancelled) return;

      if (response.status === 409 && payload.session) {
        setLockConflict(payload.session);
        setStatusMessage(`Reglement deja en cours d'edition : ${payload.session.categoryTitle}`);
        setEditingSession(null);
        return;
      }

      if (!response.ok || !payload.session) {
        return;
      }

      setLockConflict(null);
      setEditingSession(payload.session);
      setStatusMessage(`Reglement en cours d'edition : ${payload.session.categoryTitle}`);
      activeCategoryLockRef.current = payload.session.categoryId;
    }

    void sendHeartbeat();
    const interval = window.setInterval(() => {
      void sendHeartbeat();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [categoryId, editorKey, initialValues?.title, isDirty, pageId, title]);

  useEffect(() => {
    function releaseActiveLock() {
      const activeCategoryId = activeCategoryLockRef.current;
      if (!activeCategoryId) return;

      const payload = JSON.stringify({
        action: "release",
        categoryId: activeCategoryId,
        editorKey,
      });

      navigator.sendBeacon(
        "/api/admin/editing",
        new Blob([payload], {
          type: "application/json",
        }),
      );
    }

    window.addEventListener("pagehide", releaseActiveLock);
    window.addEventListener("beforeunload", releaseActiveLock);

    return () => {
      window.removeEventListener("pagehide", releaseActiveLock);
      window.removeEventListener("beforeunload", releaseActiveLock);
    };
  }, [editorKey]);

  function refreshDirtyState() {
    if (!formRef.current) return;

    const nextSnapshot = getFormSnapshot(formRef.current);
    const nextIsDirty =
      JSON.stringify(nextSnapshot) !== JSON.stringify(initialSnapshotRef.current);
    setIsDirty(nextIsDirty);
    if (nextIsDirty && saveFeedback?.status === "success") {
      setSaveFeedback(null);
    }

    if (!nextIsDirty && !lockConflict) {
      setStatusMessage(null);
    }
  }

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
        setUploading(false);
        return;
      }

      setBanner(payload.url);
      requestAnimationFrame(refreshDirtyState);
    } catch {
      setUploadError("Upload impossible.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleForceUnlock() {
    if (!categoryId || !unlockPassword || isForceUnlocking) {
      return;
    }

    setIsForceUnlocking(true);
    setUnlockFeedback(null);

    try {
      const response = await fetch("/api/admin/editing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "force-release",
          categoryId,
          editorKey,
          unlockPassword,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setUnlockFeedback(payload.error ?? "Impossible de deverrouiller cette categorie.");
        return;
      }

      setLockConflict(null);
      setEditingSession(null);
      setStatusMessage(null);
      activeCategoryLockRef.current = null;
      setUnlockPassword("");
      setUnlockFeedback("Verrou supprime. Tu peux maintenant reprendre l'edition.");
    } catch {
      setUnlockFeedback("Impossible de deverrouiller cette categorie.");
    } finally {
      setIsForceUnlocking(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-5"
      onInput={refreshDirtyState}
      onChange={refreshDirtyState}
      onSubmit={() => {
        if (isSaving) {
          return;
        }
        setSaveFeedback(null);
      }}
    >
      <input type="hidden" name="editorKey" value={editorKey} />
      <input type="hidden" name="initialCategoryId" value={initialCategoryId} />

      {statusMessage ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            isLockedByAnotherEditor
              ? "border-red-400/20 bg-red-400/10 text-red-100"
              : "border-amber-300/18 bg-amber-300/[0.06] text-amber-100/90"
          }`}
        >
          <div className="font-medium">{statusMessage}</div>
          {isLockedByAnotherEditor ? (
            <div className="mt-1 text-red-100/70">
              Edition active par {lockConflict?.editorName || lockConflict?.editorEmail}. Cette categorie est en lecture seule tant que le verrou est actif.
            </div>
          ) : (
            <div className="mt-1 text-amber-100/70">
              {editingSession?.hasUnsavedChanges
                ? "Des modifications non sauvegardees sont detectees."
                : "Edition detectee sur cette categorie."}
            </div>
          )}
        </div>
      ) : null}

      {isLockedByAnotherEditor ? (
        <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-4">
          <div className="text-sm font-medium text-white">Forcer le deverrouillage</div>
          <div className="mt-1 text-sm text-white/60">
            Si le verrou est stale ou bloque l'edition alors que tu es le seul admin, tu peux le supprimer manuellement.
          </div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="password"
              value={unlockPassword}
              onChange={(event) => setUnlockPassword(event.target.value)}
              placeholder="Mot de passe de deverrouillage"
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none md:max-w-xs"
            />
            <button
              type="button"
              onClick={handleForceUnlock}
              disabled={!unlockPassword || isForceUnlocking}
              className="rounded-md border border-rose-400/30 bg-rose-500/12 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isForceUnlocking ? "Deverrouillage..." : "Forcer le deverrouillage"}
            </button>
          </div>
          {unlockFeedback ? (
            <div className={`mt-3 text-sm ${unlockFeedback.includes("supprime") ? "text-emerald-200" : "text-red-200"}`}>
              {unlockFeedback}
            </div>
          ) : null}
        </div>
      ) : null}

      <fieldset disabled={isLockedByAnotherEditor || isSaving} className="grid gap-5 disabled:opacity-70">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Categorie">
            <select
              name="categoryId"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-[#15151c] px-4 py-3 text-white outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Statut">
            <select
              name="status"
              defaultValue={initialValues?.status ?? PageStatus.DRAFT}
              className="w-full rounded-md border border-white/10 bg-[#15151c] px-4 py-3 text-white outline-none"
            >
              <option value={PageStatus.DRAFT}>Brouillon</option>
              <option value={PageStatus.PUBLISHED}>Publie</option>
            </select>
          </Field>
        </div>

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
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
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
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
              required
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            name="description"
            defaultValue={initialValues?.description ?? ""}
            rows={3}
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            required
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Extrait">
            <textarea
              name="excerpt"
              defaultValue={initialValues?.excerpt ?? ""}
              rows={3}
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            />
          </Field>

          <div className="grid gap-4">
            <Field label="Banniere">
              <div className="space-y-3">
                <input
                  name="banner"
                  value={banner}
                  onChange={(event) => setBanner(event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  placeholder="/images/rosefa-banner-main.png"
                />
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.05]">
                  {uploading ? <LoaderCircle className="h-4 w-4 animate-spin text-rose-300" /> : <ImagePlus className="h-4 w-4 text-rose-300" />}
                  <span>{uploading ? "Upload en cours..." : "Uploader une image de banniere"}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={handleBannerUpload} />
                </label>
                {uploadError ? <div className="text-sm text-red-200">{uploadError}</div> : null}
                {banner ? (
                  <div className="overflow-hidden rounded-md border border-white/10 bg-black/25">
                    <img src={banner} alt="Preview banniere" className="h-36 w-full object-cover" />
                  </div>
                ) : null}
              </div>
            </Field>
            <Field label="Ordre">
              <input
                type="number"
                name="order"
                defaultValue={initialValues?.order ?? 0}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-white/68">Contenu du reglement</div>
                <div className="text-xs text-white/45">
                  Mise en forme rapide pour titres, gras, italique, souligne, listes et retours a la ligne.
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111118]">
              <div className="flex flex-wrap gap-2 border-b border-white/10 px-3 py-3">
                <ToolbarButton onClick={() => wrapSelection(textareaRef, setBody, "**", "**", "Texte en gras")}>
                  <Bold className="h-4 w-4" />
                  Gras
                </ToolbarButton>
                <ToolbarButton onClick={() => wrapSelection(textareaRef, setBody, "*", "*", "Texte en italique")}>
                  <Italic className="h-4 w-4" />
                  Italique
                </ToolbarButton>
                <ToolbarButton onClick={() => wrapSelection(textareaRef, setBody, "<u>", "</u>", "Texte souligne")}>
                  <Underline className="h-4 w-4" />
                  Souligne
                </ToolbarButton>
                <ToolbarButton onClick={() => prefixLines(textareaRef, setBody, "## ")}>
                  <Heading2 className="h-4 w-4" />
                  Titre 2
                </ToolbarButton>
                <ToolbarButton onClick={() => prefixLines(textareaRef, setBody, "### ")}>
                  <Heading3 className="h-4 w-4" />
                  Titre 3
                </ToolbarButton>
                <ToolbarButton onClick={() => prefixLines(textareaRef, setBody, "- ")}>
                  <List className="h-4 w-4" />
                  Liste
                </ToolbarButton>
                <ToolbarButton onClick={() => insertAtSelection(textareaRef, setBody, "\n\n")}>
                  <Pilcrow className="h-4 w-4" />
                  Ligne
                </ToolbarButton>
                <ToolbarButton onClick={() => insertAtSelection(textareaRef, setBody, "\n---\n")}>
                  <Minus className="h-4 w-4" />
                  Separateur
                </ToolbarButton>
              </div>

              <textarea
                ref={textareaRef}
                name="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={24}
                className="min-h-[460px] w-full resize-y bg-[#111118] px-4 py-4 font-mono text-sm text-white outline-none"
                required
              />
            </div>

            <div className="mt-3 text-xs leading-6 text-white/45">
              Statut edition :{" "}
              {isDirty ? (
                <span className="text-amber-200">Règlement en cours d'edition : {currentCategoryTitle}</span>
              ) : (
                <span>Aucune modification non sauvegardee.</span>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-white/68">Previsualisation</div>
            <div className="content-prose min-h-[460px] rounded-lg border border-white/10 bg-white/[0.03] p-5">
              {previewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <p>Aucun contenu a previsualiser.</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLockedByAnotherEditor || isSaving}
          className="rounded-md border border-rose-400/30 bg-rose-500/14 px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/22 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer la page"}
        </button>
        {saveFeedback ? (
          <div
            className={`text-sm ${
              saveFeedback.status === "success" ? "text-emerald-200" : "text-red-200"
            }`}
          >
            {saveFeedback.message}
          </div>
        ) : null}
      </fieldset>
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

function ToolbarButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/78 transition hover:bg-white/[0.06] hover:text-white"
    >
      {children}
    </button>
  );
}
