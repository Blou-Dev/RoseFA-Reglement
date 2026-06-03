export const OWNER_ROLE = "owner";
export const WRITER_ROLE = "writer";

export function isAdminRole(role?: string | null) {
  return role === OWNER_ROLE || role === WRITER_ROLE;
}

export function isOwnerEmail(email?: string | null) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  return Boolean(adminEmail && email?.toLowerCase().trim() === adminEmail);
}
