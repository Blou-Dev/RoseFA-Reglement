import type { Category, HomePageContent, HomePageLink, Page } from "@prisma/client";
import { HomePageSectionType, PageStatus } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
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

const SAFE_LEXIQUE_BODY = `# Lexique RP

Avant de participer a des scenes importantes, il est essentiel de connaitre les expressions et notions les plus courantes du roleplay sur RoseFA.

<Alert title="Pourquoi ce lexique ?" variant="info">
Ce lexique permet de comprendre les termes utilises sur le serveur et d'eviter les erreurs de roleplay.
</Alert>

<Accordion
  items={[
    {
      title: "Powergaming",
      content: "Le Powergaming consiste a realiser des actions impossibles ou irrealistes en forcant volontairement les limites du jeu afin d'obtenir un avantage RP."
    },
    {
      title: "Metagaming",
      content: "Le Metagaming consiste a utiliser des informations obtenues hors RP (Discord, stream, vocal externe, etc.) dans une scene RP."
    },
    {
      title: "Carjacking",
      content: "Le fait de voler un vehicule occupe ou non sans l'accord de son proprietaire dans un contexte RP coherent."
    },
    {
      title: "Mass RP",
      content: "Le Mass RP consiste a prendre en compte la presence logique de personnes non visibles autour de vous (habitants, policiers, employes, citoyens, etc.)."
    },
    {
      title: "Fear RP",
      content: "Le Fear RP represente l'instinct de survie de votre personnage. Celui-ci doit craindre la mort, les blessures, la prison et les consequences de ses actes."
    },
    {
      title: "Fear Groupe Illegal",
      content: "Le Fear Groupe Illegal s'applique aux interactions entre groupes illegaux. Cependant, sur les points chauds, celui-ci est partiellement assoupli afin de preserver les possibilites de RP. Le simple surnombre ne garantit pas automatiquement le controle d'une scene. Chaque groupe reste libre d'assumer les consequences RP de ses decisions. Les joueurs ne doivent cependant jamais agir comme des super-heros."
    },
    {
      title: "No Fear RP",
      content: "Le fait d'ignorer volontairement un danger evident ou une menace credible sans raison RP valable."
    },
    {
      title: "Chicken Run",
      content: "Courir dans tous les sens afin d'eviter artificiellement les tirs ou les coups est interdit."
    },
    {
      title: "Drive-By",
      content: "Le fait de tirer depuis un vehicule. Le Drive-By est interdit sur RoseFA. Seules certaines exceptions concernant les Forces de l'Ordre peuvent etre prevues dans les reglements specifiques."
    },
    {
      title: "Copbait",
      content: "Le fait de provoquer volontairement les Forces de l'Ordre dans le seul but de declencher une poursuite ou une intervention."
    },
    {
      title: "Gangbait",
      content: "Le fait de provoquer volontairement un groupe illegal dans le seul but de declencher un conflit."
    },
    {
      title: "Safe Zone",
      content: "Zone dans laquelle les actions hostiles, agressions et activites illegales sont interdites."
    },
    {
      title: "FreeKill / FreePunch",
      content: "Le fait de tuer ou frapper un joueur sans raison RP valable."
    },
    {
      title: "FreeLoot",
      content: "Le fait de voler les biens d'un joueur sans raison RP coherente ou sans scene prealable."
    },
    {
      title: "Pain RP",
      content: "Le fait de jouer les blessures, douleurs et consequences physiques subies par votre personnage."
    },
    {
      title: "Force RP",
      content: "Le fait d'imposer son RP a un autre joueur sans lui laisser la possibilite de repondre ou d'agir de maniere coherente."
    },
    {
      title: "Win RP",
      content: "Le fait de chercher uniquement a gagner une scene sans prendre en compte la coherence RP ou le plaisir de jeu des autres participants."
    },
    {
      title: "Coherence RP",
      content: "Le fait de jouer un personnage coherent avec son histoire, son environnement, son metier et ses connaissances."
    },
    {
      title: "Carkill",
      content: "Le fait d'ecraser volontairement un joueur avec un vehicule sans raison RP valable."
    },
    {
      title: "Revenge Kill",
      content: "Le fait de revenir sur une scene afin de se venger d'une personne responsable de votre mort ou de votre coma."
    },
    {
      title: "Coma",
      content: "Perte de conscience temporaire du personnage. Les regles de NLR s'appliquent."
    },
    {
      title: "Mort RP",
      content: "Suppression definitive d'un personnage validee selon le reglement Mort RP du serveur."
    },
    {
      title: "/me",
      content: "Commande permettant de decrire une action ou un etat que le jeu ne peut pas representer visuellement."
    },
    {
      title: "Mix",
      content: "Le fait de melanger des informations RP et HRP."
    },
    {
      title: "HRP Vocal",
      content: "Le fait de parler hors personnage durant une scene RP."
    },
    {
      title: "Insinuation HRP",
      content: "Le fait de faire comprendre a un joueur qu'il commet une erreur de reglement ou de gameplay directement en scene RP."
    },
    {
      title: "Bunny Hop",
      content: "Le fait de sauter continuellement afin d'aller plus vite. Cette pratique est interdite."
    },
    {
      title: "UseBug",
      content: "L'exploitation volontaire d'un bug afin d'obtenir un avantage RP ou gameplay."
    },
    {
      title: "Raccourci RP",
      content: "Le fait de tirer des conclusions RP sans element coherent permettant de les justifier."
    },
    {
      title: "Fairplay",
      content: "Le fait de privilegier la qualite des scenes, le plaisir de jeu et la coherence plutot que la victoire a tout prix."
    },
    {
      title: "Mal aux yeux",
      content: "Expression RP utilisee pour signaler un probleme graphique ou de FPS."
    },
    {
      title: "Mal de tete",
      content: "Expression RP utilisee pour signaler un crash ou un probleme technique."
    },
    {
      title: "Chewing-Gum",
      content: "Expression utilisee lorsqu'un joueur teleporte ou rencontre un probleme de synchronisation."
    },
    {
      title: "Tempete",
      content: "Annonce RP d'un redemarrage du serveur."
    },
    {
      title: "Prendre une pastille",
      content: "Expression utilisee pour signaler un probleme de microphone."
    },
    {
      title: "DashCam / BodyCam / GoPro",
      content: "Expression indiquant qu'un enregistrement RP est en cours selon les regles du serveur."
    },
    {
      title: "Unite X",
      content: "Expression utilisee pour justifier un retour hopital ou un deplacement administratif."
    },
    {
      title: "Faire une sieste",
      content: "Expression RP utilisee lorsqu'un joueur se deconnecte puis se reconnecte."
    },
    {
      title: "Papillon / Gouvernement",
      content: "Expression utilisee pour demander l'intervention d'un membre du Staff. Son utilisation abusive est interdite."
    }
  ]}
/>

<Callout>
L'ignorance des termes presents dans ce lexique ne constitue pas une excuse en cas de non-respect du reglement.
</Callout>`;

function normalizePublicBody({
  categorySlug,
  pageSlug,
  body,
}: {
  categorySlug: string;
  pageSlug: string;
  body: string;
}) {
  if (
    categorySlug === "reglement-rosefa" &&
    pageSlug === "lexique" &&
    (body.includes("Avant de participer Ã") ||
      body.includes("rÃ©aliser des actions irrÃ©alistes") ||
      body.includes("diffÃ©rentes notions RP utilisÃ©es") ||
      body.includes("scÃ¨nes cohÃ©rentes, immersives et agrÃ©ables"))
  ) {
    return SAFE_LEXIQUE_BODY;
  }

  return body;
}

function mapHomePageContent(
  homepage: (HomePageContent & { links: HomePageLink[] }) | null,
): HomePageContentData {
  if (!homepage) {
    return DEFAULT_HOMEPAGE;
  }

  const homepageLinks = homepage.links ?? [];

  const startLinks = homepageLinks
    .filter((link) => link.section === HomePageSectionType.START)
    .sort((left, right) => left.order - right.order);
  const regulationLinks = homepageLinks
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

export async function getPublicCategories(): Promise<PublicCategory[]> {
  noStore();
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
}

export async function getPublicPageBySlug(slug: string[]): Promise<PublicPage | null> {
  noStore();
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

  const normalizedBody = normalizePublicBody({
    categorySlug: page.category.slug,
    pageSlug: page.slug,
    body: page.body,
  });

  return {
    ...page,
    body: normalizedBody,
    href: `/docs/${page.category.slug}/${page.slug}`,
  };
}

export async function getPublishedPageParams() {
  noStore();
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
}

export async function getSearchIndex(): Promise<SearchItem[]> {
  noStore();
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
    content: normalizePublicBody({
      categorySlug: page.category.slug,
      pageSlug: page.slug,
      body: page.body,
    })
      .replace(/[#>*`-]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  }));
}

export async function getPublicHomePageContent(): Promise<HomePageContentData> {
  noStore();
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
