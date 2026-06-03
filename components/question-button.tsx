import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function QuestionButton() {
  return (
    <Link
      href={siteConfig.questionHref}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/84 transition hover:bg-white/[0.06] hover:text-white"
    >
      <MessageCircleMore className="h-4 w-4 text-rose-300" />
      Une question ?
    </Link>
  );
}
