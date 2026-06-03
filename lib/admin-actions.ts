"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { HomePageSectionType, PageStatus } from "@prisma/client";
import { z } from "zod";
import { assertAdminAccess, assertOwnerSession } from "@/lib/auth-guard";
import { releaseEditingSessionsForCategories } from "@/lib/editing-sessions";
import { prisma } from "@/lib/prisma";

export type AdminActionResult = {
  status: "success" | "error";
  message: string;
};

function isValidBannerPath(value?: string) {
  if (!value) return true;
  if (value.includes("..")) return false;
  return value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://");
}

const categorySchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  order: z.coerce.number().int(),
});

const pageSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(8),
  excerpt: z.string().optional(),
  banner: z
    .string()
    .optional()
    .refine((value) => isValidBannerPath(value), "Banniere invalide."),
  body: z.string().min(1),
  order: z.coerce.number().int(),
  status: z.nativeEnum(PageStatus),
  categoryId: z.string().min(1),
});

const homePageLinkSchema = z.object({
  section: z.nativeEnum(HomePageSectionType),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z
    .string()
    .min(1)
    .refine((value) => value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://")),
  icon: z.string().min(1),
});

const homePageSchema = z.object({
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  introTitle: z.string().min(1),
  introBody: z.string().min(1),
  introBodySecondary: z.string().min(1),
  warningText: z.string().min(1),
  banner: z
    .string()
    .min(1)
    .refine((value) => isValidBannerPath(value), "Banniere invalide."),
  links: z.array(homePageLinkSchema).min(1),
});

const writerAccountSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function revalidateDocs() {
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/admin", "layout");
  revalidatePath("/docs/[...slug]", "page");
  revalidatePath("/api/search");
}

function assertSafeDocumentBody(body: string) {
  const blockedPatterns = [
    /<script\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<link\b/i,
    /<meta\b/i,
    /\bon[a-z]+\s*=/i,
    /javascript:/i,
    /^\s*import\s/m,
    /^\s*export\s/m,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(body)) {
      throw new Error("UNSAFE_CONTENT");
    }
  }
}

function toAdminActionError(error: unknown): AdminActionResult {
  if (error instanceof z.ZodError) {
    return {
      status: "error",
      message: "Certains champs sont invalides. Verifie le formulaire avant de sauvegarder.",
    };
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return {
        status: "error",
        message: "Acces refuse. Reconnecte-toi puis reessaie.",
      };
    }

    if (error.message === "UNSAFE_CONTENT") {
      return {
        status: "error",
        message: "Le contenu contient une syntaxe bloquee pour des raisons de securite.",
      };
    }
  }

  return {
    status: "error",
    message: "La sauvegarde a echoue. Reessaie dans quelques instants.",
  };
}

export async function createCategory(formData: FormData) {
  await assertAdminAccess();
  const parsed = categorySchema.parse({
    title: formData.get("title"),
    slug: normalizeSlug(String(formData.get("slug") ?? formData.get("title") ?? "")),
    description: formData.get("description")?.toString() || "",
    order: formData.get("order") ?? 0,
  });

  const category = await prisma.category.create({
    data: parsed,
  });

  revalidateDocs();
  redirect(`/admin/categories/${category.id}`);
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await assertAdminAccess();
  const parsed = categorySchema.parse({
    title: formData.get("title"),
    slug: normalizeSlug(String(formData.get("slug") ?? formData.get("title") ?? "")),
    description: formData.get("description")?.toString() || "",
    order: formData.get("order") ?? 0,
  });

  await prisma.category.update({
    where: { id: categoryId },
    data: parsed,
  });

  revalidateDocs();
}

export async function deleteCategory(formData: FormData) {
  await assertAdminAccess();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.category.delete({
    where: { id },
  });

  revalidateDocs();
}

export async function moveCategory(formData: FormData) {
  await assertAdminAccess();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "up");
  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) return;

  const adjacent = await prisma.category.findFirst({
    where: direction === "up" ? { order: { lt: current.order } } : { order: { gt: current.order } },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });

  if (!adjacent) return;

  await prisma.$transaction([
    prisma.category.update({ where: { id: current.id }, data: { order: adjacent.order } }),
    prisma.category.update({ where: { id: adjacent.id }, data: { order: current.order } }),
  ]);

  revalidateDocs();
}

export async function createPage(formData: FormData): Promise<AdminActionResult | void> {
  try {
    await assertAdminAccess();
    const editorKey = String(formData.get("editorKey") ?? "");
    const parsed = pageSchema.parse({
      title: formData.get("title"),
      slug: normalizeSlug(String(formData.get("slug") ?? formData.get("title") ?? "")),
      description: formData.get("description"),
      excerpt: formData.get("excerpt")?.toString() || "",
      banner: formData.get("banner")?.toString() || "",
      body: formData.get("body"),
      order: formData.get("order") ?? 0,
      status: formData.get("status") ?? PageStatus.DRAFT,
      categoryId: formData.get("categoryId"),
    });
    assertSafeDocumentBody(parsed.body);

    const page = await prisma.page.create({
      data: parsed,
    });

    await releaseEditingSessionsForCategories({
      categoryIds: [parsed.categoryId],
      editorKey,
    });

    revalidateDocs();
    redirect(`/admin/pages/${page.id}`);
  } catch (error) {
    return toAdminActionError(error);
  }
}

export async function updatePage(pageId: string, formData: FormData): Promise<AdminActionResult> {
  try {
    await assertAdminAccess();
    const editorKey = String(formData.get("editorKey") ?? "");
    const initialCategoryId = String(formData.get("initialCategoryId") ?? "");
    const parsed = pageSchema.parse({
      title: formData.get("title"),
      slug: normalizeSlug(String(formData.get("slug") ?? formData.get("title") ?? "")),
      description: formData.get("description"),
      excerpt: formData.get("excerpt")?.toString() || "",
      banner: formData.get("banner")?.toString() || "",
      body: formData.get("body"),
      order: formData.get("order") ?? 0,
      status: formData.get("status") ?? PageStatus.DRAFT,
      categoryId: formData.get("categoryId"),
    });
    assertSafeDocumentBody(parsed.body);

    await prisma.page.update({
      where: { id: pageId },
      data: parsed,
    });

    await releaseEditingSessionsForCategories({
      categoryIds: [initialCategoryId, parsed.categoryId],
      editorKey,
    });

    revalidateDocs();

    return {
      status: "success",
      message: "Modifications enregistrees.",
    };
  } catch (error) {
    return toAdminActionError(error);
  }
}

export async function updateHomePage(formData: FormData): Promise<AdminActionResult> {
  try {
    await assertAdminAccess();

    const parsedLinks = JSON.parse(String(formData.get("linksJson") ?? "[]")) as unknown;
    const parsed = homePageSchema.parse({
      heroTitle: formData.get("heroTitle"),
      heroSubtitle: formData.get("heroSubtitle"),
      introTitle: formData.get("introTitle"),
      introBody: formData.get("introBody"),
      introBodySecondary: formData.get("introBodySecondary"),
      warningText: formData.get("warningText"),
      banner: formData.get("banner"),
      links: parsedLinks,
    });

    await prisma.$transaction([
      prisma.homePageLink.deleteMany({
        where: {
          homepageId: "homepage",
        },
      }),
      prisma.homePageContent.upsert({
        where: { id: "homepage" },
        update: {
          heroTitle: parsed.heroTitle,
          heroSubtitle: parsed.heroSubtitle,
          introTitle: parsed.introTitle,
          introBody: parsed.introBody,
          introBodySecondary: parsed.introBodySecondary,
          warningText: parsed.warningText,
          banner: parsed.banner,
        },
        create: {
          id: "homepage",
          heroTitle: parsed.heroTitle,
          heroSubtitle: parsed.heroSubtitle,
          introTitle: parsed.introTitle,
          introBody: parsed.introBody,
          introBodySecondary: parsed.introBodySecondary,
          warningText: parsed.warningText,
          banner: parsed.banner,
        },
      }),
      prisma.homePageLink.createMany({
        data: parsed.links.map((link, index) => ({
          homepageId: "homepage",
          section: link.section,
          title: link.title,
          description: link.description,
          href: link.href,
          icon: link.icon,
          order: (index + 1) * 10,
        })),
      }),
    ]);

    revalidateDocs();

    return {
      status: "success",
      message: "Page d'accueil enregistree.",
    };
  } catch (error) {
    return toAdminActionError(error);
  }
}

export async function deletePage(formData: FormData) {
  await assertAdminAccess();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.page.delete({
    where: { id },
  });

  revalidateDocs();
}

export async function movePage(formData: FormData) {
  await assertAdminAccess();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "up");
  const current = await prisma.page.findUnique({ where: { id } });
  if (!current) return;

  const adjacent = await prisma.page.findFirst({
    where: {
      categoryId: current.categoryId,
      ...(direction === "up" ? { order: { lt: current.order } } : { order: { gt: current.order } }),
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });

  if (!adjacent) return;

  await prisma.$transaction([
    prisma.page.update({ where: { id: current.id }, data: { order: adjacent.order } }),
    prisma.page.update({ where: { id: adjacent.id }, data: { order: current.order } }),
  ]);

  revalidateDocs();
}

function normalizeEmail(input: string) {
  return input.toLowerCase().trim();
}

export async function createWriterAccount(formData: FormData): Promise<AdminActionResult> {
  try {
    await assertOwnerSession();

    const parsed = writerAccountSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const email = normalizeEmail(parsed.email);
    const ownerEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

    if (ownerEmail && email === ownerEmail) {
      return {
        status: "error",
        message: "Cet email est reserve au compte principal RoseFA Admin.",
      };
    }

    const passwordHash = await hash(parsed.password, 10);

    await prisma.adminUser.create({
      data: {
        name: parsed.name.trim(),
        email,
        passwordHash,
      },
    });

    revalidatePath("/admin/accounts");

    return {
      status: "success",
      message: "Compte writer cree.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        message: "Nom, email ou mot de passe invalide. Le mot de passe doit contenir au moins 8 caracteres.",
      };
    }

    return toAdminActionError(error);
  }
}

export async function updateWriterAccount(formData: FormData): Promise<AdminActionResult> {
  try {
    await assertOwnerSession();

    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const email = normalizeEmail(String(formData.get("email") ?? ""));
    const password = String(formData.get("password") ?? "");
    const isActive = String(formData.get("isActive") ?? "") === "on";

    if (!id || name.length < 2 || !email) {
      return {
        status: "error",
        message: "Impossible de mettre a jour ce compte writer.",
      };
    }

    const ownerEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    if (ownerEmail && email === ownerEmail) {
      return {
        status: "error",
        message: "Cet email est reserve au compte principal RoseFA Admin.",
      };
    }

    await prisma.adminUser.update({
      where: { id },
      data: {
        name,
        email,
        isActive,
        ...(password.trim().length
          ? {
              passwordHash: await hash(password, 10),
            }
          : {}),
      },
    });

    revalidatePath("/admin/accounts");

    return {
      status: "success",
      message: "Compte writer mis a jour.",
    };
  } catch (error) {
    return toAdminActionError(error);
  }
}

export async function deleteWriterAccount(formData: FormData): Promise<AdminActionResult> {
  try {
    await assertOwnerSession();

    const id = String(formData.get("id") ?? "");
    if (!id) {
      return {
        status: "error",
        message: "Compte introuvable.",
      };
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    revalidatePath("/admin/accounts");

    return {
      status: "success",
      message: "Compte writer supprime.",
    };
  } catch (error) {
    return toAdminActionError(error);
  }
}
