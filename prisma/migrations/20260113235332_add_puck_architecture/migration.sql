-- AlterTable
ALTER TABLE "Analytics" ADD COLUMN     "location" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "tableNumber" TEXT;

-- AlterTable
ALTER TABLE "LandingPage" ADD COLUMN     "draftContent" JSONB,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "publishedContent" JSONB,
ADD COLUMN     "schemaVersion" TEXT NOT NULL DEFAULT '1.0.0',
ADD COLUMN     "seo" JSONB;

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT,
    "defaultSections" JSONB NOT NULL,
    "defaultStyles" JSONB,
    "metadata" JSONB,
    "schemaVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantMenu" (
    "id" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Main Menu',
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currencySymbol" TEXT NOT NULL DEFAULT '$',
    "categories" JSONB NOT NULL,
    "settings" JSONB,
    "schemaVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPageMenuItem" (
    "id" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPageMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Template_category_idx" ON "Template"("category");

-- CreateIndex
CREATE INDEX "Template_isPremium_idx" ON "Template"("isPremium");

-- CreateIndex
CREATE INDEX "Template_isActive_idx" ON "Template"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantMenu_landingPageId_key" ON "RestaurantMenu"("landingPageId");

-- CreateIndex
CREATE INDEX "RestaurantMenu_landingPageId_idx" ON "RestaurantMenu"("landingPageId");

-- CreateIndex
CREATE INDEX "LandingPageMenuItem_landingPageId_idx" ON "LandingPageMenuItem"("landingPageId");

-- CreateIndex
CREATE INDEX "LandingPageMenuItem_category_idx" ON "LandingPageMenuItem"("category");

-- CreateIndex
CREATE INDEX "Analytics_tableNumber_idx" ON "Analytics"("tableNumber");

-- CreateIndex
CREATE INDEX "Analytics_location_idx" ON "Analytics"("location");

-- CreateIndex
CREATE INDEX "LandingPage_templateId_idx" ON "LandingPage"("templateId");

-- CreateIndex
CREATE INDEX "LandingPage_isPublished_idx" ON "LandingPage"("isPublished");

-- AddForeignKey
ALTER TABLE "RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingPage" ADD CONSTRAINT "LandingPage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingPageMenuItem" ADD CONSTRAINT "LandingPageMenuItem_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
