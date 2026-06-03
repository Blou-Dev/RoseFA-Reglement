-- CreateTable
CREATE TABLE "CategoryEditSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "pageId" TEXT,
    "pageTitle" TEXT,
    "editorEmail" TEXT NOT NULL,
    "editorName" TEXT,
    "editorKey" TEXT NOT NULL,
    "hasUnsavedChanges" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CategoryEditSession_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryEditSession_categoryId_key" ON "CategoryEditSession"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryEditSession_expiresAt_idx" ON "CategoryEditSession"("expiresAt");
