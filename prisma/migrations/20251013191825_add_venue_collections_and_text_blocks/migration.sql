-- CreateTable
CREATE TABLE "CollectionVenue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "venueId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CollectionVenue_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionVenue_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueTariffHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "venueId" INTEGER NOT NULL,
    "tariff" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "price" INTEGER,
    "autoRenewed" BOOLEAN NOT NULL DEFAULT false,
    "cancelledBy" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueTariffHistory_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "VenuePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueTariffHistory_cancelledBy_fkey" FOREIGN KEY ("cancelledBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueAnalytics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "venueId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "referrer" TEXT,
    "timeOnPage" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VenueAnalytics_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "VenuePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueNews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "venueId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueNews_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "VenuePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueNews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueView" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "venueId" INTEGER NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VenueView_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "VenuePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "venueId" INTEGER NOT NULL,
    "claimType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "claimedBy" TEXT NOT NULL,
    "claimData" JSONB,
    "adminNotes" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueClaim_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "VenuePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hideFromAfisha" BOOLEAN NOT NULL DEFAULT false,
    "showInVenues" BOOLEAN NOT NULL DEFAULT false,
    "showInMain" BOOLEAN NOT NULL DEFAULT false,
    "showInBlog" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "city" TEXT NOT NULL,
    "citySlug" TEXT,
    "eventsTitle" TEXT,
    "eventsDescription" TEXT,
    "venuesTitle" TEXT,
    "venuesDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Collection" ("city", "citySlug", "coverImage", "createdAt", "description", "hideFromAfisha", "id", "isActive", "order", "slug", "title", "updatedAt") SELECT "city", "citySlug", "coverImage", "createdAt", "description", "hideFromAfisha", "id", "isActive", "order", "slug", "title", "updatedAt" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
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
    "workingHours" TEXT,
    "timezone" TEXT,
    "fiasId" TEXT,
    "kladrId" TEXT,
    "tariffExpiresAt" DATETIME,
    "tariffAutoRenew" BOOLEAN NOT NULL DEFAULT false,
    "tariffGracePeriodEndsAt" DATETIME,
    "tariffPrice" INTEGER,
    "priceFrom" INTEGER,
    "priceTo" INTEGER,
    "ageFrom" INTEGER,
    "ageTo" INTEGER,
    "richDescription" TEXT,
    "newsCountThisMonth" INTEGER NOT NULL DEFAULT 0,
    "newsResetAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
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
CREATE INDEX "VenuePartner_tariff_idx" ON "VenuePartner"("tariff");
CREATE INDEX "VenuePartner_tariffExpiresAt_idx" ON "VenuePartner"("tariffExpiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CollectionVenue_collectionId_idx" ON "CollectionVenue"("collectionId");

-- CreateIndex
CREATE INDEX "CollectionVenue_venueId_idx" ON "CollectionVenue"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionVenue_collectionId_venueId_key" ON "CollectionVenue"("collectionId", "venueId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshToken_key" ON "UserSession"("refreshToken");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE INDEX "UserSession_refreshToken_idx" ON "UserSession"("refreshToken");

-- CreateIndex
CREATE INDEX "VenueTariffHistory_venueId_idx" ON "VenueTariffHistory"("venueId");

-- CreateIndex
CREATE INDEX "VenueTariffHistory_tariff_idx" ON "VenueTariffHistory"("tariff");

-- CreateIndex
CREATE INDEX "VenueTariffHistory_startedAt_idx" ON "VenueTariffHistory"("startedAt");

-- CreateIndex
CREATE INDEX "VenueTariffHistory_endedAt_idx" ON "VenueTariffHistory"("endedAt");

-- CreateIndex
CREATE INDEX "VenueAnalytics_venueId_date_idx" ON "VenueAnalytics"("venueId", "date");

-- CreateIndex
CREATE INDEX "VenueAnalytics_date_idx" ON "VenueAnalytics"("date");

-- CreateIndex
CREATE INDEX "VenueAnalytics_referrer_idx" ON "VenueAnalytics"("referrer");

-- CreateIndex
CREATE INDEX "VenueNews_venueId_idx" ON "VenueNews"("venueId");

-- CreateIndex
CREATE INDEX "VenueNews_authorId_idx" ON "VenueNews"("authorId");

-- CreateIndex
CREATE INDEX "VenueNews_isPublished_idx" ON "VenueNews"("isPublished");

-- CreateIndex
CREATE INDEX "VenueNews_createdAt_idx" ON "VenueNews"("createdAt");

-- CreateIndex
CREATE INDEX "VenueView_venueId_idx" ON "VenueView"("venueId");

-- CreateIndex
CREATE INDEX "VenueView_ipAddress_idx" ON "VenueView"("ipAddress");

-- CreateIndex
CREATE INDEX "VenueView_createdAt_idx" ON "VenueView"("createdAt");

-- CreateIndex
CREATE INDEX "VenueClaim_venueId_idx" ON "VenueClaim"("venueId");

-- CreateIndex
CREATE INDEX "VenueClaim_status_idx" ON "VenueClaim"("status");

-- CreateIndex
CREATE INDEX "VenueClaim_claimedBy_idx" ON "VenueClaim"("claimedBy");

-- CreateIndex
CREATE INDEX "VenueClaim_createdAt_idx" ON "VenueClaim"("createdAt");
