-- DropIndex
DROP INDEX "Snippet_code_trgm_idx";

-- DropIndex
DROP INDEX "Snippet_description_trgm_idx";

-- DropIndex
DROP INDEX "Snippet_language_trgm_idx";

-- DropIndex
DROP INDEX "Snippet_title_trgm_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "accentDensity" TEXT NOT NULL DEFAULT 'comfortable',
    "editorFontSize" INTEGER NOT NULL DEFAULT 13,
    "tabSize" INTEGER NOT NULL DEFAULT 2,
    "wordWrap" BOOLEAN NOT NULL DEFAULT true,
    "showLineNumbers" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
