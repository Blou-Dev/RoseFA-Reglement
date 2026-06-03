import { mkdir, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const prismaDir = path.join(projectRoot, "prisma");
const dbPath = path.join(prismaDir, "dev.db");
const backupDir = path.join(projectRoot, "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const jsonPath = path.join(backupDir, `rosefa-content-backup-${timestamp}.json`);
const sqliteCopyPath = path.join(backupDir, `rosefa-dev-${timestamp}.db`);

function readTable(database, table) {
  return database.prepare(`SELECT * FROM "${table}"`).all();
}

function hasTable(database, table) {
  const row = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table);

  return Boolean(row);
}

await mkdir(backupDir, { recursive: true });

const db = new DatabaseSync(dbPath, {
  open: true,
  readOnly: true,
});

const payload = {
  exportedAt: new Date().toISOString(),
  source: dbPath,
  categories: readTable(db, "Category"),
  pages: readTable(db, "Page"),
  homePageContents: readTable(db, "HomePageContent"),
  homePageLinks: readTable(db, "HomePageLink"),
  adminUsers: hasTable(db, "AdminUser") ? readTable(db, "AdminUser") : [],
};

db.close();

await writeFile(jsonPath, JSON.stringify(payload, null, 2), "utf8");
await copyFile(dbPath, sqliteCopyPath);

console.log(`JSON backup: ${jsonPath}`);
console.log(`SQLite copy: ${sqliteCopyPath}`);
