import type { ComponentType } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Gavel,
  Landmark,
  Shield,
  Store,
  Sword,
  Wifi,
} from "lucide-react";
import { Banner } from "@/components/banner";
import { Callout } from "@/components/callout";
import { QuestionButton } from "@/components/question-button";
import { SectionSummary } from "@/components/section-summary";
import { getPublicHomePageContent } from "@/lib/docs";
import type { HomePageLinkItem } from "@/lib/types";

const summaryLinks = [
  { label: "Bienvenue", href: "#bienvenue" },
  { label: "Commencer ici", href: "#commencer-ici" },
  { label: "Reglements principaux", href: "#reglements-principaux" },
];

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  shield: Shield,
  wifi: Wifi,
  gavel: Gavel,
  landmark: Landmark,
  sword: Sword,
  store: Store,
};

export default async function HomePage() {
  const homepage = await getPublicHomePageContent();

  return (
    <div className="space-y-8">
      <Banner
        title={homepage.heroTitle}
        description={homepage.heroSubtitle}
        image={homepage.banner}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_250px]">
        <div className="min-w-0 space-y-8">
          <section id="bienvenue" className="border-b border-white/10 pb-8">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">Bienvenue</div>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white md:text-5xl md:leading-[1.02]">
                {homepage.introTitle}
              </h2>
              <p className="mt-5 text-sm leading-8 text-white/68 md:text-base">{homepage.introBody}</p>
              <p className="mt-4 text-sm leading-8 text-white/62 md:text-base">
                {homepage.introBodySecondary}
              </p>
              <div className="mt-5 md:hidden">
                <QuestionButton />
              </div>
            </div>
          </section>

          <section>
            <Callout>
              <span className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-rose-300" />
                <span>{homepage.warningText}</span>
              </span>
            </Callout>
          </section>

          <section id="commencer-ici" className="space-y-4">
            <SectionHeader
              title="Commencer ici"
              description="Les points d'entree les plus utiles pour comprendre rapidement les bases et rejoindre RoseFA dans de bonnes conditions."
            />
            <LinkList items={homepage.startLinks} />
          </section>

          <section id="reglements-principaux" className="space-y-4">
            <SectionHeader
              title="Reglements principaux"
              description="Les regles essentielles a connaitre avant de participer pleinement a la vie du serveur."
            />
            <LinkList items={homepage.regulationLinks} />
          </section>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-[calc(var(--topbar-height)+1rem)] border-l border-white/10 pl-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">Sommaire</div>
            <SectionSummary links={summaryLinks} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-2xl font-bold tracking-[-0.04em] text-white md:text-[2rem]">{title}</h3>
      <p className="max-w-3xl text-sm leading-8 text-white/62 md:text-base">{description}</p>
    </div>
  );
}

function LinkList({ items }: { items: HomePageLinkItem[] }) {
  const safeItems = items ?? [];

  return (
    <div className="border-t border-white/10">
      {safeItems.map((item) => (
        <LinkRow key={`${item.section}-${item.id}-${item.href}`} item={item} />
      ))}
    </div>
  );
}

function LinkRow({ item }: { item: HomePageLinkItem }) {
  const Icon = iconMap[item.icon] ?? BookOpen;

  return (
    <Link
      href={item.href}
      className="group grid gap-3 border-b border-white/10 py-4 transition hover:bg-white/[0.02] md:grid-cols-[24px_minmax(0,220px)_minmax(0,1fr)_20px] md:items-start md:gap-5"
    >
      <div className="pt-0.5">
        <Icon className="h-4 w-4 text-rose-200/80" />
      </div>
      <div className="text-sm font-semibold text-white md:text-[15px]">{item.title}</div>
      <div className="text-sm leading-7 text-white/60">{item.description}</div>
      <div className="hidden justify-end md:flex">
        <ArrowRight className="h-4 w-4 text-white/24 transition group-hover:text-rose-200" />
      </div>
    </Link>
  );
}
