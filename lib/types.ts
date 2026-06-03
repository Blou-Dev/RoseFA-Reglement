import type { AdminUser, Category, HomePageSectionType, Page } from "@prisma/client";

export type SearchItem = {
  title: string;
  description: string;
  href: string;
  section: string;
  content: string;
};

export type PublicPage = Page & {
  href: string;
  category: Category;
};

export type PublicCategory = Category & {
  pages: Array<
    Page & {
      href: string;
    }
  >;
};

export type HomePageLinkItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  order: number;
  section: HomePageSectionType;
};

export type HomePageContentData = {
  heroTitle: string;
  heroSubtitle: string;
  introTitle: string;
  introBody: string;
  introBodySecondary: string;
  warningText: string;
  banner: string;
  startLinks: HomePageLinkItem[];
  regulationLinks: HomePageLinkItem[];
};

export type AdminWriterAccount = Pick<AdminUser, "id" | "email" | "name" | "isActive" | "createdAt" | "updatedAt">;
