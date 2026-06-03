import { cache } from "react";
import type { Category, HomePageContent, HomePageLink, Page } from "@prisma/client";
import { HomePageSectionType, PageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminWriterAccount, HomePageContentData, PublicCategory, PublicPage, SearchItem } from "@/lib/types";

const DEFAULT_HOMEPAGE: HomePageContentData = {
  heroTitle: "RoseFA",
  heroSubtitle: "Documentation officielle du serveur",
  introTitle: "Bienvenue sur la documentation RoseFA",
  introBody:
    "Retrouvez ici l'ensemble des regles, guides et informations importantes du serveur.",
  introBodySecondary:
    "Cette documentation vous permet de comprendre le fonctionnement de RoseFA, les regles a respecter et les bases necessaires pour jouer dans de bonnes conditions. Avant de commencer, nous vous conseillons de lire le lexique RP, les notions de base ainsi que le reglement global. En cas de situation complexe, d'ambiguite ou de cas non prevu, l'appreciation staff et inter-admin prime afin de preserver la coherence et la qualite de la scene.",
  warningText:
    "En rejoignant RoseFA, vous acceptez de respecter le reglement du serveur. Le non-respect des regles peut entrainer des sanctions. Le staff conserve le dernier mot lorsqu'une situation demande une adaptation, une interpretation ou une decision exceptionnelle pour proteger le bon deroulement d'une scene.",
  banner: "/images/rosefa-banner-main.png",
  startLinks: [
    {
      id: "default-start-1",
      section: HomePageSectionType.START,
      title: "Lexique",
      description: "Comprendre les termes RP utilises sur le serveur.",
      href: "/docs/reglement-rosefa/lexique",
      icon: "book-open",
      order: 10,
    },
    {
      id: "default-start-2",
      section: HomePageSectionType.START,
      title: "Notions de base",
      description: "Connaitre les bases necessaires avant de participer a des scenes importantes.",
      href: "/docs/reglement-rosefa/notions-de-base",
      icon: "shield",
      order: 20,
    },
    {
      id: "default-start-3",
      section: HomePageSectionType.START,
      title: "Se connecter a RoseFA",
      description: "Suivre les etapes pour rejoindre le serveur correctement.",
      href: "/docs/guides-utiles/se-connecter-a-rosefa",
      icon: "wifi",
      order: 30,
    },
  ],
  regulationLinks: [
    {
      id: "default-reg-1",
      section: HomePageSectionType.REGULATION,
      title: "Reglement global",
      description: "Les regles generales applicables a tous les joueurs.",
      href: "/docs/reglement-rosefa/reglement-global",
      icon: "gavel",
      order: 10,
    },
    {
      id: "default-reg-2",
      section: HomePageSectionType.REGULATION,
      title: "Reglement legal",
      description: "Les regles concernant les entreprises, services publics et activites legales.",
      href: "/docs/reglement-rosefa/reglement-legal",
      icon: "landmark",
      order: 20,
    },
    {
      id: "default-reg-3",
      section: HomePageSectionType.REGULATION,
      title: "Reglement illegal",
      description: "Les regles concernant les groupes illegaux, points chauds, braquages et descentes.",
      href: "/docs/reglement-rosefa/reglement-illegal",
      icon: "sword",
      order: 30,
    },
    {
      id: "default-reg-4",
      section: HomePageSectionType.REGULATION,
      title: "Reglement boutique",
      description: "Les conditions liees aux achats, remboursements et avantages boutique.",
      href: "/docs/reglement-rosefa/reglement-boutique",
      icon: "store",
      order: 40,
    },
  ],
};

function mapHomePageContent(
  homepage: (HomePageContent & { links: HomePageLink[] }) | null,
): HomePageContentData {
  if (!homepage) {
    return DEFAULT_HOMEPAGE;
  }

  const startLinks = homepage.links
    .filter((link) => link.section === HomePageSectionType.START)
    .sort((left, right) => left.order - right.order);
  const regulationLinks = homepage.links
    .filter((link) => link.section === HomePageSectionType.REGULATION)
    .sort((left, right) => left.order - right.order);

  return {
    heroTitle: homepage.heroTitle || DEFAULT_HOMEPAGE.heroTitle,
    heroSubtitle: homepage.heroSubtitle || DEFAULT_HOMEPAGE.heroSubtitle,
    introTitle: homepage.introTitle || DEFAULT_HOMEPAGE.introTitle,
    introBody: homepage.introBody || DEFAULT_HOMEPAGE.introBody,
    introBodySecondary: homepage.introBodySecondary || DEFAULT_HOMEPAGE.introBodySecondary,
    warningText: homepage.warningText || DEFAULT_HOMEPAGE.warningText,
    banner: homepage.banner || DEFAULT_HOMEPAGE.banner,
    startLinks: startLinks.length ? startLinks : DEFAULT_HOMEPAGE.startLinks,
    regulationLinks: regulationLinks.length ? regulationLinks : DEFAULT_HOMEPAGE.regulationLinks,
  };
}

export const getPublicCategories = cache(async (): Promise<PublicCategory[]> => {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
    include: {
      pages: {
        where: { status: PageStatus.PUBLISHED },
        orderBy: [{ order: "asc" }, { title: "asc" }],
      },
    },
  });

  return categories
    .map((category) => ({
      ...category,
      pages: category.pages.map((page) => ({
        ...page,
        href: `/docs/${category.slug}/${page.slug}`,
      })),
    }))
    .filter((category) => category.pages.length > 0);
});

export const getPublicPageBySlug = cache(async (slug: string[]): Promise<PublicPage | null> => {
  if (slug.length !== 2) return null;
  const [categorySlug, pageSlug] = slug;

  const page = await prisma.page.findFirst({
    where: {
      slug: pageSlug,
      status: PageStatus.PUBLISHED,
      category: {
        slug: categorySlug,
      },
    },
    include: {
      category: true,
    },
  });

  if (!page) return null;

  return {
    ...page,
    href: `/docs/${page.category.slug}/${page.slug}`,
  };
});

export const getPublishedPageParams = cache(async () => {
  const pages = await prisma.page.findMany({
    where: { status: PageStatus.PUBLISHED },
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  return pages.map((page) => ({
    slug: [page.category.slug, page.slug],
  }));
});

export const getSearchIndex = cache(async (): Promise<SearchItem[]> => {
  const pages = await prisma.page.findMany({
    where: { status: PageStatus.PUBLISHED },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    include: {
      category: true,
    },
  });

  return pages.map((page) => ({
    title: page.title,
    description: page.description,
    href: `/docs/${page.category.slug}/${page.slug}`,
    section: page.category.title,
    content: page.body.replace(/[#>*`-]/g, " ").replace(/\s+/g, " ").trim(),
  }));
});

export const getPublicHomePageContent = cache(async (): Promise<HomePageContentData> => {
  const homepage = await prisma.homePageContent.findUnique({
    where: { id: "homepage" },
    include: {
      links: {
        orderBy: [{ order: "asc" }, { title: "asc" }],
      },
    },
  });

  return mapHomePageContent(homepage);
});

export async function getAdminCategories(): Promise<Array<Category & { pages: Page[] }>> {
  return prisma.category.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
    include: {
      pages: {
        orderBy: [{ order: "asc" }, { title: "asc" }],
      },
    },
  });
}

export async function getAdminCategory(id: string): Promise<(Category & { pages: Page[] }) | null> {
  return prisma.category.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: [{ order: "asc" }, { title: "asc" }],
      },
    },
  });
}

export async function getAdminPage(id: string): Promise<(Page & { category: Category }) | null> {
  return prisma.page.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function getAdminHomePageContent(): Promise<HomePageContentData> {
  const homepage = await prisma.homePageContent.findUnique({
    where: { id: "homepage" },
    include: {
      links: {
        orderBy: [{ order: "asc" }, { title: "asc" }],
      },
    },
  });

  return mapHomePageContent(homepage);
}

export async function getAdminWriterAccounts(): Promise<AdminWriterAccount[]> {
  return prisma.adminUser.findMany({
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
