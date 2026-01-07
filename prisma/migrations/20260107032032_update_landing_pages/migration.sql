/*
  Warnings:

  - You are about to drop the column `published` on the `LandingPage` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `LandingPage` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `LandingPage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customDomain]` on the table `LandingPage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `prompt` to the `AIUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response` to the `AIUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokensUsed` to the `AIUsage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIUsage" ADD COLUMN     "prompt" TEXT NOT NULL,
ADD COLUMN     "response" TEXT NOT NULL,
ADD COLUMN     "tokensUsed" INTEGER NOT NULL,
ALTER COLUMN "model" DROP NOT NULL,
ALTER COLUMN "promptTokens" DROP NOT NULL,
ALTER COLUMN "completionTokens" DROP NOT NULL,
ALTER COLUMN "totalTokens" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LandingPage" DROP COLUMN "published",
DROP COLUMN "theme",
DROP COLUMN "title",
ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Untitled Landing Page',
ADD COLUMN     "templateId" TEXT NOT NULL DEFAULT 'modern-minimal';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiUsageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiUsageHistory" JSONB,
ADD COLUMN     "aiUsageResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "AIUsage_feature_idx" ON "AIUsage"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_customDomain_key" ON "LandingPage"("customDomain");

-- CreateIndex
CREATE INDEX "LandingPage_customDomain_idx" ON "LandingPage"("customDomain");
