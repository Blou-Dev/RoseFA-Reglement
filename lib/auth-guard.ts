import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdminRole, isOwnerEmail, OWNER_ROLE } from "@/lib/auth-shared";

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session || !isAdminRole(session.user?.role)) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireOwnerSession() {
  const session = await requireAdminSession();

  if (session.user?.role !== OWNER_ROLE || !isOwnerEmail(session.user?.email)) {
    redirect("/admin");
  }

  return session;
}

export async function assertAdminAccess() {
  const session = await getAdminSession();

  if (!session || !isAdminRole(session.user?.role)) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function assertOwnerSession() {
  const session = await getAdminSession();

  if (!session || session.user?.role !== OWNER_ROLE || !isOwnerEmail(session.user?.email)) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}
