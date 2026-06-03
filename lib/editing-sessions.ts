import { prisma } from "@/lib/prisma";

const EDIT_SESSION_TTL_MS = 15 * 60 * 1000;

function getExpiryDate() {
  return new Date(Date.now() + EDIT_SESSION_TTL_MS);
}

export async function cleanupExpiredEditingSessions() {
  await prisma.categoryEditSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

export async function getActiveEditingSession(categoryId: string) {
  await cleanupExpiredEditingSessions();

  return prisma.categoryEditSession.findFirst({
    where: {
      categoryId,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      category: true,
    },
  });
}

export async function getActiveEditingSessions() {
  await cleanupExpiredEditingSessions();

  return prisma.categoryEditSession.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function heartbeatEditingSession({
  categoryId,
  pageId,
  pageTitle,
  editorEmail,
  editorName,
  editorKey,
  hasUnsavedChanges,
}: {
  categoryId: string;
  pageId?: string | null;
  pageTitle?: string | null;
  editorEmail: string;
  editorName?: string | null;
  editorKey: string;
  hasUnsavedChanges: boolean;
}) {
  await cleanupExpiredEditingSessions();

  const existing = await prisma.categoryEditSession.findUnique({
    where: { categoryId },
    include: {
      category: true,
    },
  });

  if (
    existing &&
    existing.expiresAt > new Date() &&
    existing.editorKey !== editorKey &&
    existing.editorEmail.toLowerCase().trim() !== editorEmail.toLowerCase().trim()
  ) {
    return {
      ok: false as const,
      session: existing,
    };
  }

  const session = await prisma.categoryEditSession.upsert({
    where: { categoryId },
    update: {
      pageId: pageId ?? null,
      pageTitle: pageTitle ?? null,
      editorEmail,
      editorName: editorName ?? null,
      editorKey,
      hasUnsavedChanges,
      expiresAt: getExpiryDate(),
    },
    create: {
      categoryId,
      pageId: pageId ?? null,
      pageTitle: pageTitle ?? null,
      editorEmail,
      editorName: editorName ?? null,
      editorKey,
      hasUnsavedChanges,
      expiresAt: getExpiryDate(),
    },
    include: {
      category: true,
    },
  });

  return {
    ok: true as const,
    session,
  };
}

export async function releaseEditingSession({
  categoryId,
  editorKey,
  editorEmail,
  force = false,
}: {
  categoryId: string;
  editorKey: string;
  editorEmail?: string;
  force?: boolean;
}) {
  if (!categoryId || (!editorKey && !editorEmail && !force)) {
    return;
  }

  await prisma.categoryEditSession.deleteMany({
    where: {
      categoryId,
      ...(force
        ? {}
        : editorKey
          ? {
              OR: [
                { editorKey },
                ...(editorEmail
                  ? [{ editorEmail: editorEmail.toLowerCase().trim() }]
                  : []),
              ],
            }
          : editorEmail
            ? { editorEmail: editorEmail.toLowerCase().trim() }
            : {}),
    },
  });
}

export async function releaseEditingSessionsForCategories({
  categoryIds,
  editorKey,
  editorEmail,
}: {
  categoryIds: string[];
  editorKey: string;
  editorEmail?: string;
}) {
  const filteredCategoryIds = [...new Set(categoryIds.filter(Boolean))];
  if (filteredCategoryIds.length === 0 || (!editorKey && !editorEmail)) {
    return;
  }

  await prisma.categoryEditSession.deleteMany({
    where: {
      categoryId: {
        in: filteredCategoryIds,
      },
      ...(editorKey
        ? {
            OR: [
              { editorKey },
              ...(editorEmail
                ? [{ editorEmail: editorEmail.toLowerCase().trim() }]
                : []),
            ],
          }
        : editorEmail
          ? { editorEmail: editorEmail.toLowerCase().trim() }
          : {}),
    },
  });
}
