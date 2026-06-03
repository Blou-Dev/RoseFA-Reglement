import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { assertAdminAccess } from "@/lib/auth-guard";
import {
  getActiveEditingSession,
  heartbeatEditingSession,
  releaseEditingSession,
} from "@/lib/editing-sessions";

export async function GET(request: Request) {
  try {
    await assertAdminAccess();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? "";

  if (!categoryId) {
    return NextResponse.json({ session: null });
  }

  const editingSession = await getActiveEditingSession(categoryId);

  return NextResponse.json({
    session: editingSession
      ? {
          categoryId: editingSession.categoryId,
          categoryTitle: editingSession.category.title,
          pageId: editingSession.pageId,
          pageTitle: editingSession.pageTitle,
          editorEmail: editingSession.editorEmail,
          editorName: editingSession.editorName,
          editorKey: editingSession.editorKey,
          hasUnsavedChanges: editingSession.hasUnsavedChanges,
          expiresAt: editingSession.expiresAt.toISOString(),
          ownedByCurrentAdmin:
            editingSession.editorEmail.toLowerCase().trim() === sessionEmail?.toLowerCase().trim(),
        }
      : null,
  });
}

export async function POST(request: Request) {
  try {
    await assertAdminAccess();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email;

  const payload = (await request.json()) as {
    action?: string;
    categoryId?: string;
    pageId?: string;
    pageTitle?: string;
    editorKey?: string;
    hasUnsavedChanges?: boolean;
    unlockPassword?: string;
  };

  const action = payload.action ?? "heartbeat";
  const categoryId = payload.categoryId?.toString() ?? "";
  const editorKey = payload.editorKey?.toString() ?? "";

  if (!categoryId || !editorKey) {
    return NextResponse.json({ error: "Missing categoryId or editorKey" }, { status: 400 });
  }

  if (action === "release") {
    await releaseEditingSession({
      categoryId,
      editorKey,
      editorEmail: sessionEmail?.toLowerCase().trim(),
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "force-release") {
    const unlockPassword = payload.unlockPassword?.toString() ?? "";
    const expectedPassword = process.env.ADMIN_UNLOCK_PASSWORD ?? "1703";

    if (unlockPassword !== expectedPassword) {
      return NextResponse.json({ error: "Mot de passe de deverrouillage invalide." }, { status: 403 });
    }

    await releaseEditingSession({
      categoryId,
      editorKey,
      editorEmail: sessionEmail?.toLowerCase().trim(),
      force: true,
    });
    return NextResponse.json({ ok: true });
  }

  const result = await heartbeatEditingSession({
    categoryId,
    pageId: payload.pageId?.toString() ?? null,
    pageTitle: payload.pageTitle?.toString() ?? null,
    editorEmail: sessionEmail!.toLowerCase().trim(),
    editorName: session?.user?.name ?? "RoseFA Admin",
    editorKey,
    hasUnsavedChanges: Boolean(payload.hasUnsavedChanges),
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: "Cette categorie est deja en cours d'edition.",
        session: {
          categoryId: result.session.categoryId,
          categoryTitle: result.session.category.title,
          pageId: result.session.pageId,
          pageTitle: result.session.pageTitle,
          editorEmail: result.session.editorEmail,
          editorName: result.session.editorName,
          editorKey: result.session.editorKey,
          hasUnsavedChanges: result.session.hasUnsavedChanges,
          expiresAt: result.session.expiresAt.toISOString(),
        },
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    session: {
      categoryId: result.session.categoryId,
      categoryTitle: result.session.category.title,
      pageId: result.session.pageId,
      pageTitle: result.session.pageTitle,
      editorEmail: result.session.editorEmail,
      editorName: result.session.editorName,
      editorKey: result.session.editorKey,
      hasUnsavedChanges: result.session.hasUnsavedChanges,
      expiresAt: result.session.expiresAt.toISOString(),
    },
  });
}
