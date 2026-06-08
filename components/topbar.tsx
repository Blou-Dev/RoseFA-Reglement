import type { PublicCategory } from "@/lib/types";
import { Logo } from "@/components/logo";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { QuestionButton } from "@/components/question-button";
import { SearchBar } from "@/components/search-bar";

export function Topbar({ categories }: { categories: PublicCategory[] }) {
  const safeCategories = categories ?? [];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/55 backdrop-blur-md">
      <div className="mx-auto flex min-h-[var(--topbar-height)] max-w-[var(--page-max-width)] items-center gap-3 px-3 py-3 md:gap-4 md:px-6 md:py-0 xl:px-8">
        <MobileSidebar categories={safeCategories} />
        <div className="hidden lg:block xl:min-w-[250px]">
          <Logo />
        </div>
        <div className="min-w-0 flex-1 lg:flex lg:justify-center">
          <SearchBar />
        </div>
        <div className="hidden md:block">
          <QuestionButton />
        </div>
      </div>
    </header>
  );
}
