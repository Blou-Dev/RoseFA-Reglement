import { AdminShell } from "@/components/admin/admin-shell";
import { WriterAccountsManager } from "@/components/admin/writer-accounts-manager";
import {
  createWriterAccount,
  deleteWriterAccount,
  updateWriterAccount,
} from "@/lib/admin-actions";
import { requireOwnerSession } from "@/lib/auth-guard";
import { getAdminWriterAccounts } from "@/lib/docs";

export default async function AdminAccountsPage() {
  const session = await requireOwnerSession();
  const writers = await getAdminWriterAccounts();

  return (
    <AdminShell
      title="Comptes writer"
      description="Gere les comptes secondaires autorises a acceder au panel RoseFA pour mettre a jour la documentation."
    >
      <WriterAccountsManager
        ownerEmail={session.user?.email ?? ""}
        writers={writers}
        createAction={createWriterAccount}
        updateAction={updateWriterAccount}
        deleteAction={deleteWriterAccount}
      />
    </AdminShell>
  );
}
