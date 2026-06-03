import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const backupPath = process.argv[2];

if (!backupPath) {
  console.error("Usage: node scripts/import-content-to-postgres.mjs <backup-json-path>");
  process.exit(1);
}

const generatedClientPath = path.join(projectRoot, "generated", "postgres-client", "index.js");

let Prisma;
try {
  Prisma = await import(pathToFileURL(generatedClientPath).href);
} catch {
  console.error("Postgres client introuvable. Lance d'abord: npm run prisma:generate:postgres");
  process.exit(1);
}

const {
  PrismaClient,
  AdminUserRole,
  HomePageSectionType,
  PageStatus,
} = Prisma;

const prisma = new PrismaClient();
const resolvedBackupPath = path.resolve(projectRoot, backupPath);
const raw = await readFile(resolvedBackupPath, "utf8");
const backup = JSON.parse(raw);

await prisma.$transaction(async (tx) => {
  await tx.homePageLink.deleteMany();
  await tx.homePageContent.deleteMany();
  await tx.categoryEditSession.deleteMany();
  await tx.page.deleteMany();
  await tx.category.deleteMany();
  await tx.adminUser.deleteMany();

  for (const category of backup.categories ?? []) {
    await tx.category.create({
      data: {
        id: category.id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        order: category.order,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      },
    });
  }

  for (const page of backup.pages ?? []) {
    await tx.page.create({
      data: {
        id: page.id,
        categoryId: page.categoryId,
        title: page.title,
        slug: page.slug,
        description: page.description,
        excerpt: page.excerpt,
        body: page.body,
        banner: page.banner,
        order: page.order,
        status: page.status === "PUBLISHED" ? PageStatus.PUBLISHED : PageStatus.DRAFT,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt),
      },
    });
  }

  for (const homepage of backup.homePageContents ?? []) {
    await tx.homePageContent.create({
      data: {
        id: homepage.id,
        heroTitle: homepage.heroTitle,
        heroSubtitle: homepage.heroSubtitle,
        introTitle: homepage.introTitle,
        introBody: homepage.introBody,
        introBodySecondary: homepage.introBodySecondary,
        warningText: homepage.warningText,
        banner: homepage.banner,
        createdAt: new Date(homepage.createdAt),
        updatedAt: new Date(homepage.updatedAt),
      },
    });
  }

  for (const link of backup.homePageLinks ?? []) {
    await tx.homePageLink.create({
      data: {
        id: link.id,
        homepageId: link.homepageId,
        section:
          link.section === "REGULATION"
            ? HomePageSectionType.REGULATION
            : HomePageSectionType.START,
        title: link.title,
        description: link.description,
        href: link.href,
        icon: link.icon,
        order: link.order,
        createdAt: new Date(link.createdAt),
        updatedAt: new Date(link.updatedAt),
      },
    });
  }

  for (const adminUser of backup.adminUsers ?? []) {
    await tx.adminUser.create({
      data: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        passwordHash: adminUser.passwordHash,
        role: adminUser.role === "WRITER" ? AdminUserRole.WRITER : AdminUserRole.WRITER,
        isActive: Boolean(adminUser.isActive),
        createdAt: new Date(adminUser.createdAt),
        updatedAt: new Date(adminUser.updatedAt),
      },
    });
  }
});

await prisma.$disconnect();

console.log(`Import PostgreSQL termine depuis ${resolvedBackupPath}`);
