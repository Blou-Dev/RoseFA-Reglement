import { DocShell } from "@/components/doc-shell";
import { getPublicCategories } from "@/lib/docs";

import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const categories = await getPublicCategories();

  return <DocShell categories={categories}>{children}</DocShell>;
}
