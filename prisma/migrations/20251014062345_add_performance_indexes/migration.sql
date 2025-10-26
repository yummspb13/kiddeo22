/*
  Warnings:

  - You are about to drop the `BlogCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VenueAnalytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VenueClaim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VenueNews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VenueTariffHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VenueView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `newsCountThisMonth` on the `VenuePartner` table. All the data in the column will be lost.
  - You are about to drop the column `newsResetAt` on the `VenuePartner` table. All the data in the column will be lost.
  - You are about to drop the column `richDescription` on the `VenuePartner` table. All the data in the column will be lost.
  - You are about to drop the column `tariffAutoRenew` on the `VenuePartner` table. All the data in the column will be lost.
  - You are about to drop the column `tariffExpiresAt` on the `VenuePartner` table. All the data in the column will be lost.
  - You are about to drop the column `tariffGracePeriodEndsAt` on the `VenuePartner` table. All the data in the column will be lost.
  - You are about to drop the column `tariffPrice` on the `VenuePartner` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `VenuePartner` table. All the data in the column will be lost.
  - You are about to drop the column `workingHours` on the `VenuePartner` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BlogCategory_isActive_idx";

-- DropIndex
DROP INDEX "BlogCategory_slug_idx";

-- DropIndex
DROP INDEX "BlogCategory_slug_key";

-- DropIndex
DROP INDEX "BlogCategory_name_key";

-- DropIndex
DROP INDEX "BlogComment_createdAt_idx";

-- DropIndex
DROP INDEX "BlogComment_isApproved_idx";

-- DropIndex
DROP INDEX "BlogComment_parentId_idx";

-- DropIndex
DROP INDEX "BlogComment_userId_idx";

-- DropIndex
DROP INDEX "BlogComment_postId_idx";

-- DropIndex
DROP INDEX "BlogLike_postId_userId_key";

-- DropIndex
DROP INDEX "BlogLike_userId_idx";

-- DropIndex
DROP INDEX "BlogLike_postId_idx";

-- DropIndex
DROP INDEX "BlogPost_cityId_idx";

-- DropIndex
DROP INDEX "BlogPost_categoryId_idx";

-- DropIndex
DROP INDEX "BlogPost_authorId_idx";

-- DropIndex
DROP INDEX "BlogPost_isFeatured_idx";

-- DropIndex
DROP INDEX "BlogPost_publishedAt_idx";

-- DropIndex
DROP INDEX "BlogPost_status_idx";

-- DropIndex
DROP INDEX "BlogPost_slug_idx";

-- DropIndex
DROP INDEX "BlogPost_slug_key";

-- DropIndex
DROP INDEX "VenueAnalytics_referrer_idx";

-- DropIndex
DROP INDEX "VenueAnalytics_date_idx";

-- DropIndex
DROP INDEX "VenueAnalytics_venueId_date_idx";

-- DropIndex
DROP INDEX "VenueClaim_createdAt_idx";

-- DropIndex
DROP INDEX "VenueClaim_claimedBy_idx";

-- DropIndex
DROP INDEX "VenueClaim_status_idx";

-- DropIndex
DROP INDEX "VenueClaim_venueId_idx";

-- DropIndex
DROP INDEX "VenueNews_createdAt_idx";

-- DropIndex
DROP INDEX "VenueNews_isPublished_idx";

-- DropIndex
DROP INDEX "VenueNews_authorId_idx";

-- DropIndex
DROP INDEX "VenueNews_venueId_idx";

-- DropIndex
DROP INDEX "VenueTariffHistory_endedAt_idx";

-- DropIndex
DROP INDEX "VenueTariffHistory_startedAt_idx";

-- DropIndex
DROP INDEX "VenueTariffHistory_tariff_idx";

-- DropIndex
DROP INDEX "VenueTariffHistory_venueId_idx";

-- DropIndex
DROP INDEX "VenueView_createdAt_idx";

-- DropIndex
DROP INDEX "VenueView_ipAddress_idx";

-- DropIndex
DROP INDEX "VenueView_venueId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogCategory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogComment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogLike";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogPost";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VenueAnalytics";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VenueClaim";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VenueNews";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VenueTariffHistory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VenueView";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CollectionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionEvent_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AfishaEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CollectionEvent" ("collectionId", "createdAt", "eventId", "id", "updatedAt") SELECT "collectionId", "createdAt", "eventId", "id", "updatedAt" FROM "CollectionEvent";
DROP TABLE "CollectionEvent";
ALTER TABLE "new_CollectionEvent" RENAME TO "CollectionEvent";
CREATE UNIQUE INDEX "CollectionEvent_collectionId_eventId_key" ON "CollectionEvent"("collectionId", "eventId");
CREATE TABLE "new_CollectionVenue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "venueId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionVenue_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionVenue_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "VenuePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CollectionVenue" ("collectionId", "createdAt", "id", "order", "updatedAt", "venueId") SELECT "collectionId", "createdAt", "id", "order", "updatedAt", "venueId" FROM "CollectionVenue";
DROP TABLE "CollectionVenue";
ALTER TABLE "new_CollectionVenue" RENAME TO "CollectionVenue";
CREATE UNIQUE INDEX "CollectionVenue_collectionId_venueId_key" ON "CollectionVenue"("collectionId", "venueId");
CREATE TABLE "new_VenuePartner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "additionalImages" TEXT,
    "subcategoryId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "tariff" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "moderationReason" TEXT,
    "district" TEXT,
    "metro" TEXT,
    "lat" REAL,
    "lng" REAL,
    "priceFrom" INTEGER,
    "priceTo" INTEGER,
    "ageFrom" INTEGER,
    "ageTo" INTEGER,
    "timezone" TEXT,
    "fiasId" TEXT,
    "kladrId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenuePartner_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VenuePartner_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VenuePartner_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "VenueSubcategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VenuePartner" ("additionalImages", "address", "ageFrom", "ageTo", "cityId", "coverImage", "createdAt", "description", "district", "fiasId", "id", "kladrId", "lat", "lng", "metro", "moderationReason", "name", "priceFrom", "priceTo", "slug", "status", "subcategoryId", "tariff", "timezone", "updatedAt", "vendorId") SELECT "additionalImages", "address", "ageFrom", "ageTo", "cityId", "coverImage", "createdAt", "description", "district", "fiasId", "id", "kladrId", "lat", "lng", "metro", "moderationReason", "name", "priceFrom", "priceTo", "slug", "status", "subcategoryId", "tariff", "timezone", "updatedAt", "vendorId" FROM "VenuePartner";
DROP TABLE "VenuePartner";
ALTER TABLE "new_VenuePartner" RENAME TO "VenuePartner";
CREATE UNIQUE INDEX "VenuePartner_slug_key" ON "VenuePartner"("slug");
CREATE INDEX "VenuePartner_subcategoryId_idx" ON "VenuePartner"("subcategoryId");
CREATE INDEX "VenuePartner_vendorId_idx" ON "VenuePartner"("vendorId");
CREATE INDEX "VenuePartner_status_idx" ON "VenuePartner"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Collection_isActive_showInMain_city_idx" ON "Collection"("isActive", "showInMain", "city");

-- CreateIndex
CREATE INDEX "Collection_isActive_showInVenues_idx" ON "Collection"("isActive", "showInVenues");

-- CreateIndex
CREATE INDEX "Collection_isActive_hideFromAfisha_city_idx" ON "Collection"("isActive", "hideFromAfisha", "city");

-- CreateIndex
CREATE INDEX "Collection_isActive_showInBlog_idx" ON "Collection"("isActive", "showInBlog");

-- CreateIndex
CREATE INDEX "Collection_city_isActive_idx" ON "Collection"("city", "isActive");

-- CreateIndex
CREATE INDEX "Collection_order_createdAt_idx" ON "Collection"("order", "createdAt");

-- CreateIndex
CREATE INDEX "Content_type_status_idx" ON "Content"("type", "status");

-- CreateIndex
CREATE INDEX "Content_type_status_createdAt_idx" ON "Content"("type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Content_categoryId_type_status_idx" ON "Content"("categoryId", "type", "status");

-- CreateIndex
CREATE INDEX "VenueCategory_isActive_idx" ON "VenueCategory"("isActive");

-- CreateIndex
CREATE INDEX "VenueCategory_name_idx" ON "VenueCategory"("name");

-- CreateIndex
CREATE INDEX "VenueSubcategory_categoryId_isActive_idx" ON "VenueSubcategory"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "VenueSubcategory_isActive_idx" ON "VenueSubcategory"("isActive");
