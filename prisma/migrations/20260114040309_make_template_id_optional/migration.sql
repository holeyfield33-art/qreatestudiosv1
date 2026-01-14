-- DropForeignKey
ALTER TABLE "LandingPage" DROP CONSTRAINT "LandingPage_templateId_fkey";

-- AlterTable
ALTER TABLE "LandingPage" ALTER COLUMN "templateId" DROP NOT NULL,
ALTER COLUMN "templateId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "LandingPage" ADD CONSTRAINT "LandingPage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
